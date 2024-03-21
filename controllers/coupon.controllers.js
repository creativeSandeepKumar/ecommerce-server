import { asyncHandler } from "../utils/asyncHandler.js";
import {Coupon} from "../models/coupon.model.js";
import { ApiError } from "../utils/ApiError.js";
import { getCart } from "./cart.controllers.js";
import { Cart } from "../models/cart.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CouponTypesEnum } from "../constants.js";
import { getMongoosePaginationOptions} from "../utils/helpers.js"
import mongoose from "mongoose";


const createCoupon = asyncHandler(async(req, res) => {
    const { name, couponCode, type = CouponTypesEnum.FLAT, discountValue, minimumCartValue, startDate, expiryDate } = req.body;

    const duplicateCoupon = await Coupon.findOne({
        couponCode: couponCode.trim().toUpperCase(),
    });

    if(duplicateCoupon) {
        throw new ApiError(409, "Coupon with code " + duplicateCoupon.couponCode + " already exists");
    }

    if(minimumCartValue && +minimumCartValue < +discountValue) {
        throw new ApiError(400, "Minimum cart value must be greater than or equal to the discount value")
    }

    const coupon = await Coupon.create({
        name,
        couponCode,
        type,
        discountValue,
        minimumCartValue,
        startDate,
        expiryDate,
        owner: req.user._id
    });

    return res.status(200).json(new ApiResponse(201, coupon, "Coupon created successfully"));

})

const applyCoupon = asyncHandler(async (req, res) => {
    const {couponCode} = req.body;

    let aggregatedCoupon = await Coupon.aggregate([
        {
            $match: {
                couponCode:couponCode.trim().toUpperCase(),
                startDate: {
                    $lt: new Date(),
                },
                expiryDate: {
                    $gt: new Date(),
                },
                isActive: {
                    $eq: true
                }
            }
        }
    ]);

    const coupon = aggregatedCoupon[0];

    if(!coupon) {
        throw new ApiError(404, "Invalid coupon code");
    }

    const userCart = await getCart(req.user._id);

    if(userCart.cartTotal < coupon.minimumCartValue) {
        throw new ApiError(400, "Add items worth INR " + (coupon.minimumCartValue - userCart.cartTotal) + "/- or more to apply this cupon");
    }

    await Cart.findOneAndUpdate(
        {
        owner: req.user._id,
    },
    {
        $set: {
            coupon: coupon._id,
        }
    },
    {
        new: true
    }
    );

    const newCart = await getCart(req.user._id);

    return res.status(200).json(new ApiResponse(200, new ApiResponse(201, newCart, "Coupon applied successfully")));

});

const updateCouponActivityStatus = asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    const { couponId } = req.params;

    const updatedCoupon = await Coupon.findByIdAndUpdate(
        couponId,
        {
            $set: {
                isActive,
            },
        },
        {
            new: true
        }
    );

    if(!updateCoupon) {
        throw new ApiError(404, "Coupon does not exist");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedCoupon, `Coupon is ${updateCoupon?.isActive ? "active" : "inactive"}`)
    );

});

const getAllCoupons = asyncHandler(async(req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const couponAggregate = Coupon.aggregate([{
        $match: {}
    }]);

    const coupons = await Coupon.aggregatePaginate(
        couponAggregate,
        getMongoosePaginationOptions({
            page,
            limit,
            customLabels: {
                totalDocs: "totalCoupons",
                docs: "coupons"
            }
        })
    )

    return res.status(200).json(new ApiResponse(200, coupons, "Coupons fetched successfully"));

});

const removeCouponFromCart = asyncHandler(async(req, res) => {
    await Cart.findOneAndUpdate(
        {
            owner: req.user._id,
        },
        {
            $set: {
                coupon: null,
            }
        },
        {
            new: true
        }
    );

    const newCart = await getCart(req.user._id);

    return res.status(200).json(new ApiResponse(200, newCart, "Coupon removed successfully"))

});

const getValidCouponsForCustomers = asyncHandler(async(req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const userCart = await getCart(req.user._id);
    const cartTotal = userCart.cartTotal;

    console.log("check cart total", cartTotal);

    const couponAggregate = Coupon.aggregate([
        {
            $match: {
                // startDate: {
                //     $lt: new Date(),
                // },
                expiryDate: {
                    $gt: new Date(),
                },
                isActive: {
                    $eq: true
                },
                minimumCartValue: {
                    $lte: Number(cartTotal),
                }
            }
        }
    ]);

    const coupon = await Coupon.aggregatePaginate(
        couponAggregate,
        getMongoosePaginationOptions({
            page,
            limit,
            customLabels: {
                totalDocs: "totalDocs",
                docs: "coupons"
            }
        })
    );

    return res.status(200).json(new ApiResponse(200, coupon, "Customer coupons fetched successfully"));

})
const getCouponById = asyncHandler(async(req, res) => {
    const {couponId} = req.params;

    const coupon = await Coupon.findById(couponId);

    if(!coupon) {
        throw new ApiError(404, "Coupon does not exist");
    }

    return res.status(200).json(new ApiResponse(200, coupon, "Coupon fethed successfully"))

});

const updateCoupon = asyncHandler(async(req, res) => {
    const { couponId } = req.params;
    const { name, couponCode, type = CouponTypesEnum.FLAT, discountValue, minimumCartValue, startDate, expiryDate } = req.body;

    const couponToBeUpdated = await Coupon.findById(couponId);

    if(!couponToBeUpdated) {
        throw new ApiError(404, "Coupon does not exist");
    }

    const duplicateCoupon = await Coupon.aggregate([
        {
            $match: {
                couponCode: couponCode?.trim().toUpperCase(),
                _id: {
                    $ne: new mongoose.Types.ObjectId(couponToBeUpdated._id)
                }
            }
        }
    ]);

    if(duplicateCoupon[0]) {
        throw new ApiError(409, "Coupon with code " + duplicateCoupon[0].couponCode + " already exists");
    }

    const _minimumCartValue = minimumCartValue || couponToBeUpdated.minimumCartValue;
    const _discountValue = discountValue || couponToBeUpdated.discountValue;

    if(_minimumCartValue && + _minimumCartValue < + _discountValue) {
        throw new ApiError(400, "Minimum cart value must be greater than or equal to the discount value")
    }

    const coupon = await Coupon.findByIdAndUpdate(
        couponId,
        {
            $set: {
                name,
                couponCode,
                type,
                discountValue,
                minimumCartValue,
                startDate,
                expiryDate,
                owner: req.user._id
            }
    },
    {
        new: true
    }
    );

    return res.status(200).json(new ApiResponse(201, coupon, "Coupon updated successfully"));

});

const deleteCoupon = asyncHandler(async (req, res) => {
    const { couponId } = req.params;

    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

    if(!deletedCoupon) {
        throw new ApiError(404, "Coupon does not exist");
    }

    return res.status(200).json(new ApiResponse(200, {deletedCoupon}, "Coupon does not exist"));
}) 

export {
    applyCoupon,
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    removeCouponFromCart,
    getValidCouponsForCustomers,
    updateCouponActivityStatus
}