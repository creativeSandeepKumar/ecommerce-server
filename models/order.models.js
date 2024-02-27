import mongoose, {Schema} from "mongoose";

import { 
    AvailableCouponTypes,
    AvailablePaymentProviders,
    OrderStatusEnum,
    PaymentProviderEnum,
 } from "../constants.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const orderSchema = new Schema(
    {
        orderPrice: {
            type: Number,
            required: true,
        },
        discountOrderPrice: {
            type: Number,
            required: true,
        },
        coupon: {
            type: Schema.Types.ObjectId,
            ref: "Coupon",
            default: null,
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        items: {
            type: [
                {
                    productId: {
                        type: Schema.Types.ObjectId,
                        ref: "Product",
                    },
                    quantity: {
                        type: Number,
                        required: true,
                        min: [1, "Quantity can not be less then 1"],
                        default: 1,
                    },
                }
            ],
            default: [],
        },
        address: {
            type: Schema.Types.ObjectId,
            ref: "Address",
        },
        status: {
            type: String,
            enum: AvailableOrderStatuses,
            default: OrderStatusEnum.PENDING,
        },
        paymentProvider: {
            type: String,
            enum: AvailablePaymentProviders,
            default: PaymentProviderEnum.UNKNOWN,
        },
        paymentId: {
            type: String,
        },
        isPaymentDone: {
            type: String,
            default: false
        },
    },
    {
        timestamps: true
    }
);

orderSchema.plugin(mongooseAggregatePaginate);

export const Order = mongoose.model("Order");
