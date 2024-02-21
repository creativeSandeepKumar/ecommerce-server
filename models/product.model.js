import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const imageVariantSchema = new Schema({
    name: String,
    colorCode: String,
    images: [
        {
            url: String,
            localPath: String,
        }
    ]
});

const productSchema = new Schema({
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    mainImage: {
        type: {
            url: String,
            localPath: String,
        },
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    maxPrice: {
        type: String,
        default: 0,
    },
    sellPrice: {
        type: String,
        default: 0,
    },
    discountPercentage: {
        type: String,
        default: 0,
    },
    activeOffers: [
        {
            type: Schema.Types.ObjectId,
            ref: "ActiveOffer",
        }
    ],
    stock: {
        type: String,
        default: 0,
    },
    specifications: [
        {
            name: String,
            description: String,
        }
    ],
    mainImageVariant: {
        type: Schema.Types.ObjectId,
        ref: "imageVariantSchema" // referencing the imageVariantSchema directly
    },
    subImageVariants: [imageVariantSchema]
}, {timestamps: true});

productSchema.plugin(mongooseAggregatePaginate);

export const Product = mongoose.model("Product", productSchema);
