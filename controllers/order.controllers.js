import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Address } from "../models/address.model.js"
import { Cart } from "../models/cart.model.js";
import { getCart } from "./cart.controllers.js"
import { nanoid } from "nanoid";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.models.js";
import { AvailableOrderStatuses, OrderStatusEnum, PaymentProviderEnum } from "../constants.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";
import { getMongoosePaginationOptions } from "../utils/helpers.js";


const generatePaypalAccessToken = async() => {
    try {
        const auth = Buffer.from(
            process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_SECRET
        ).toString("base64");

        const response = await fetch(`${paypalBaseUrl.sandbox}/v1/oauth2/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const data = await response.json();
        return data?.access_token;

    } catch (error) {
        throw new ApiError(500, "Error while generating paypal auth token");
    }
}

const orderFullfilmentHelper = async(orderPaymentId, req) => {
    const order = await Order.findByIdAndUpdate(
        {
            paymentId: orderPaymentId,
        },
        {
            $set: {
                isPaymentDone: true,
            }
        },
        {
            new: true
        }
    );

    if(!order) {
        throw new ApiError(404, "Order does not exist");
    }

    const cart = await Cart.findOne({
        owner: req.user._id,
    });


    const userCart = await getCart.findOne({
        owner: req.user._id,
    });

    let bulkStockUpdates = userCart.items.map((item) => {
        return {
            updateOne: {
                filter: { _id: item.product?._id },
                update: { $inc: {stock: -item.qunatity} },
            }
        }
    });

    await Product.bulkWrite(bulkStockUpdates, {
        skipValidation: true,
    });

    await sendEmail({
        email: req.user?.email,
        subject: 'Order confirmed',
        maingenContent: orderConfirmationMailgenContent(
            req.user?.username,
            userCart.items,
            order.discountedOrderPrice ?? 0
        ),
    });

    cart.items = [];
    cart.coupon = null;

    await cart.save({ validateBeforeSave: false });
    return order;

}

const paypalApi = async (endpoint, body = {}) => {
    const accessToken = await generatePaypalAccessToken();
    return await fetch(`${paypalBaseUrl.sandbox}/v2/checkout/orders${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
    });
};

let razorpayInstance;
class RazorPay {
    constructor(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) {
        // this.razorpay = RAZORPAY_KEY_ID
    }
}

try {
    razorpayInstance = new RazorPay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
} catch (error) {
    console.error("RAZOEPAY ERROR: ", error);
}

const generateRazorPayOrder = asyncHandler(async(req, res) => {
    const { addressId } = req.body;

    if(!razorpayInstance) {
        console.error("RAZORPAY ERROR: `key_id` is mandatory");
        throw new ApiError(500, "Internal server error")
    }

    const address = await Address.findOne({
        _id: addressId,
        owner: req.user._id,
    });

    if(!address) {
        throw new ApiError(404, "Address does not exists");
    }

    const cart = await Cart.findOne({
        owner: req.user._id,
    });

    if(!cart || !cart.items?.length) {
        throw new ApiError(400, "User cart is empty")
    }

    const orderItems = cart.items;
    const userCart = await getCart(req.user._id);

    const totalPrice = userCart.cartTotal;
    const totalDiscountedPrice = userCart.discountedTotal;

    const orderOptions = {
        amount: parseInt(totalDiscountedPrice) * 100,
        currency: "INR",
        receipt: nanoid(10),
    };

    razorpayInstance.orders.create(
        orderOptions,
        async function (err, razorpayOrder) {
            if(!razorpayOrder || (err && err.error)) {
                return res.status(err.statusCode)
                .json(
                    new ApiResponse(
                        err.statusCode,
                        null,
                        err.error.reason || "Something went wrong while initialising the razorpay order."
                    )
                )
            }
            const unpaidorder = await Order.create({
                address: addressId,
                customer: req.user._id,
                items: orderItems,
                orderPrice: totalPrice ?? 0,
                discountedOrderPrice: totalDiscountedPrice ?? 0,
                paymentProvider: PaymentProviderEnum.RAZORPAY,
                paymentId: razorpayOrder._id,
                coupon: userCart.coupon?._id,
            });

            if(unpaidorder) {
                return res.status(200).json(new ApiResponse(200, razorpayOrder, "Razorpay order generated"));
            } else {
                return res.status(500).json(new ApiResponse(500, null, "Something went wrong while initialising the razorpay order."));
            }
        }
    )
});

const verifyRazorPayPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    let body = razorpay_order_id + "| " + razorpay_payment_id;

    let expectedSinature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

    if(expectedSinature === razorpay_signature) {
        const order = await orderFullfilmentHelper(razorpay_order_id, req);

        return res.status(201).json(new ApiResponse(201, order, "order placed successfully"));
    } else {
        throw new ApiError(400, "Invalid razorpay signature")
    }
});


const verifyPaypalPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const response = await paypalApi(`/${orderId}/capture`, {});

    const capturedData = await response.json();

    if(capturedData?.status === "COMPLETED") {
        const order = await orderFullfilmentHelper(capturedData.id, req);

        return res.status(201).json(new ApiResponse(201, order, "order placed successfully"));
    } else {
        throw new ApiError(500, "Something went wrong with the paypal payment");
    }
});


const generatePaypalOrder = asyncHandler(async(req, res) => {
    const { addressId } = req.body;

    const address = await Address.findOne({
        _id: addressId,
        owner: req.user._id,
    });

    if(!address) {
        throw new ApiError(404, "Address does not exists");
    }

    const cart = await Cart.findOne({
        owner: req.user._id,
    });

    if(!cart || !cart.items?.length) {
        throw new ApiError(400, "User cart is empty")
    }

    const orderItems = cart.items;
    const userCart = await getCart(req.user._id);

    const totalPrice = userCart.cartTotal;
    const totalDiscountedPrice = userCart.discountedTotal;

    const response = await paypalApi("/", {
        intent: "CAPTURE",
        purchase_units: [
            {
            amount: {
                currency_code: "USD",
                value: (totalDiscountedPrice * 0.012).toFixed(0),
            }
        }
        ]
    });

    const paypalOrder = await response.json();

    if(paypalOrder?.id) {
        const unpaidorder = await Order.create({
            address: addressId,
            customer: req.user._id,
            items: orderItems,
            orderPrice: totalPrice ?? 0,
            discountedOrderPrice: totalDiscountedPrice ?? 0,
            paymentProvider: PaymentProviderEnum.RAZORPAY,
            paymentId: razorpayOrder._id,
            coupon: userCart.coupon?._id,
        });

        if(unpaidorder) {
            return res.status(200).json(new ApiResponse(200, paypalOrder, "Paypal order generated successfully"));
        }
    }

    console.log( "Make sure you have provided your PAYPAL credentials in the .env file");

    throw new ApiError(500, "Something went wrong while initialising the paypal order.")

});

const getOrderById = asyncHandler(async(req, res) => {
    const { orderId } = req.params;
    const order = await Order.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(orderId),
            }
        },
        {
            $lookup: {
                from: "addresses",
                localField: "address",
                foreignField: "_id",
                as: "address",
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "customer",
                foreignField: "_id",
                as: "customer",
                pipeline: [
                    {
                   $project: {
                    _id: 1,
                    username: 1,
                    email: 1
                   }
                }
                ]
            }
        },
        {
            $lookup: {
                from: "coupons",
                localField: "_id",
                foreignField: "coupon",
                as: "coupon",
                pipeline: [
                    {
                   $project: {
                    name: 1,
                    couponcode: 1
                   }
                }
                ]
            }
        },
        {
            $addFields: {
                customer: { $first: "$customer" },
                address: { $first: "$address" },
                coupon: { $ifNull: [{ $first: "$coupon"}, null ]},
            }
        },
        {
            $unwind: "$items"
        },
        {
            $lookup: {
                from: "products",
                localField: "items.prodcutId",
                foreignField: "_id",
                as: "items.product",
            }
        },
        {
            $addFields: { "items.product": {$first: "$items.product"} }
        },
        {
            $group: {
                _id: "$_id",
                order: {$first: "$$ROOT"},
                orderItems: {
                    $push: {
                        _id: "$items._id",
                        quantity: "$items.quantity",
                        product: "$items.product",
                    }
                }
            }
        },
        {
            $addFields: {
                orderItems: 0
            }
        }
    ]);

    if(!order[0]) {
        throw new ApiError(404, "Order does not exist");
    }

    return res.status(200).json(new ApiResponse(200, order[0], "Order fetched successfully"))

})


const getOrderListAdmin = asyncHandler(async(req, res) => {

    const { status, page = 1, limit = 10 } = req.query;

    const orderAggregate = await Order.aggregate([
        {
            $match: 
               status && AvailableOrderStatuses.includes(status.toUpperCase()) ? {
                status: status.toUpperCase(),
               } : {}  
        },
        {
            $lookup: {
                from: "addresses",
                localField: "address",
                foreignField: "_id",
                as: "address",
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "customer",
                foreignField: "_id",
                as: "customer",
                pipeline: [
                    {
                   $project: {
                    _id: 1,
                    username: 1,
                    email: 1
                   }
                }
                ]
            }
        },
        {
            $lookup: {
                from: "coupons",
                localField: "_id",
                foreignField: "coupon",
                as: "coupon",
                pipeline: [
                    {
                   $project: {
                    name: 1,
                    couponcode: 1
                   }
                }
                ]
            }
        },
        {
            $addFields: {
                customer: { $first: "$customer" },
                address: { $first: "$address" },
                coupon: { $ifNull: [{ $first: "$coupon"}, null ]},
                totalOrderItems: {$size: "$items"},
            }
        },
       {
        $project: {
            items: 0
        }
       }
    ]);

    const orders = await Order.aggregatePaginate(
        orderAggregate,
        getMongoosePaginationOptions({
            page,
            limit,
            customLabels: {
                totalDocs: "totalDocs",
                docs: "orders"
            }
        })
    )

    return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"))

});

const updateOrderStatus = asyncHandler(async(req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    let order = await Order.findById(orderId);

    if(!order) {
        throw new ApiError(404, "Order does not exist");
    }

    if(order.status === OrderStatusEnum.DELIVERED) {
        throw new ApiError(400, "Order is already delivered");
    }

    order = await Order.findByIdAndUpdate(
        orderId,
        {
            $set: {
                status,
            }
        },
        {
            new: true,
        }
    );

    return res.status(200).json(new ApiResponse(200, {status}, "Order status changed successfully"));

})

export {
    generateRazorPayOrder,
    generatePaypalOrder,
    verifyRazorPayPayment,
    verifyPaypalPayment,
    getOrderById,
    getOrderListAdmin,
    updateOrderStatus
}