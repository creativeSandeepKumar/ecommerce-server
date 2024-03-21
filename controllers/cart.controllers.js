import { Cart } from "../models/cart.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js"
import { ApiError } from "../utils/ApiError.js";

export const getCart = async (userId) => {
    const cartAggregation = await Cart.aggregate([
        {
            $match: {
                owner: userId,
            }
        },
        {
            $unwind: "$items",
        },
        {
            $lookup: {
                from: "products",
                localField: "items.productId",
                foreignField: "_id",
                as: "product",
                pipeline: [
                    {
                        $lookup: {
                          from: "colors", // Lookup the imageVariant schema (assuming the collection name is lowercase)
                          localField: "subImageVariants.color", // Foreign field in the Product schema
                          foreignField: "_id", // Local field in the imageVariant schema
                          as: "colors", // Name for the output array (singular as it's an ObjectId)
                          pipeline: [
                            {
                              $project: {
                                name: 1,
                                colorCode: 1,
                              }
                            }
                          ]
                        },
                      },
                      {
                        $project: {
                            name: 1,
                            sellPrice: 1,
                            maxPrice: 1,
                            discountPercentage: 1,
                            // ... other desired product fields
                            color: { $ifNull: ["$colors", null] }, // Access color from mainImageVariant
                            mainImage: 1,
                        }
                      }
                ]
            }
        },
        {
            $project: {
                product: {$first: "$product"},
                quantity: "$items.quantity",
                coupon: 1,
            }
        },
        {
            $group: {
                _id: "$_id",
                items: {
                    $push: "$$ROOT",
                },
                coupon: {$first: "$coupon"},
                cartTotal: {
                    $sum: {
                        // $multiply: ["$product.sellPrice", "$quantity"],
                        $multiply: [
                            { $convert: { input: "$product.sellPrice", to: "decimal" } }, // Convert to decimal
                            "$quantity"
                          ]
                    }
                }
            }
        },
        {
           $lookup: {
            from: "coupons",
            localField: "coupon",
            foreignField: "_id",
            as: "coupon"
           }
        },
        {
            $addFields: {
              // As lookup returns an array we access the first item in the lookup array
              coupon: { $first: "$coupon" },
            },
          },
        {
            $addFields: {
                discountedTotal: {
                    $ifNull: [
                        {
                            $subtract: ["$cartTotal", "$coupon.discountValue"],
                        },
                        "$cartTotal",
                    ]
                }
            }
        },
        {
            $project: {
              _id: "$_id",
              items: 1,
              coupon: 1,
              cartTotal: {
                $toString: { $ifNull: ["$cartTotal", "0"] }  // Handle potential null values
              },
              discountedTotal: {
                $toString: { $ifNull: ["$discountedTotal", "0"] }
              }
            }
          }
          
    ]);
  
      
      
    return (
        cartAggregation[0] ?? {
            _id: null,
            items: [],
            cartTotal: 0,
            discountedTotal: 0
        }
    )
};

const getUserCart = asyncHandler(async(req, res) => {
    let cart = await getCart(req.user._id);

    return res.status(200).json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

const clearCart = asyncHandler(async(req, res) => {
    await Cart.findOneAndUpdate(
        {
            owner: req.user._id,
        },
        {
            $set: {
                items: [],
                coupon: null,
            }
        },
        {
            new: true
        }
    );
    const cart = await getCart(req.user._id);

    return res.status(200).json(new ApiResponse(200, cart, "Cart has been cleared"));
});

const addItemOrUpdateItemQuantity = asyncHandler(async(req, res) => {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

    const cart = await Cart.findOne({
        owner: req.user._id,
    });

    const product = await Product.findById(productId);

    if(!product) {
        throw new ApiError(404, "Product does not exist")
    }

    if(Number(quantity) > Number(product.stock)) {
        throw new ApiError(400, product.stock > 0 ? "Only " + product.stock + " Products are remaining. But you are adding " + quantity : "Product is out of stock");
    }

    const addedProduct = cart?.items?.find((item) => item.productId.toString() === productId);

    if(addedProduct) {
        addedProduct.quantity = quantity;
        
        if(cart.coupon) {
            cart.coupon = null;
        } 
    } else {
        cart.items.push({
            productId,
            quantity,
        })
    }

    await cart.save({ validateBeforeSave: true });

    const newCart = await getCart(req.user._id);

    return res.status(200).json(new ApiResponse(200, newCart, "Item added successfully"));


});

const removeItemFromCart = asyncHandler(async(req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if(!product) {
        throw new ApiError(404, "Product does not exist")
    }

    const updatedCart = await Cart.findOneAndUpdate(
        {
        owner: req.user._id,
    },
    {
        $pull: {
            items: {
                productId: productId,
            }
        }
    },
    {
        new: true
    }
    );

    let cart = await getCart(req.user._id);


    if(cart.coupon && cart.cartTotal < cart.coupon.minimumCartValue ) {
       updatedCart.coupon = null;
       await updatedCart.save({ validateBeforeSave: false });
       cart = await getCart(req.user._id);
    }

    return res.status(200).json(new ApiResponse(200, cart, "Cart Item removed successfully"));
})


export {
    getUserCart,
    clearCart,
    addItemOrUpdateItemQuantity,
    removeItemFromCart
}

