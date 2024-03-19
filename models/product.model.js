import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const imageVariantSchema = new Schema({
  color: {
    type: Schema.Types.ObjectId,
    ref: "Color",
    required: true,
  },
  images: [
    {
      url: String,
      localPath: String,
    },
  ],
});

const productSchema = new Schema(
  {
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
    bestfor: {
      type: Schema.Types.ObjectId,
      ref: "Bestfor",
    },
    noicecancellation:{
      type: Schema.Types.ObjectId,
      ref: "Noicecancellation",
    },
    dialshape: {
      type: Schema.Types.ObjectId,
      ref: "Dialshape",
    },
    display: {
      type: Schema.Types.ObjectId,
      ref: "Display",
    },
    playback:{
      type: Schema.Types.ObjectId,
      ref: "Playback",
    },
    features: {
      type: [{
          type: Schema.Types.ObjectId,
          ref: "Feature",
        },
      ],
    },
    activeOffers: [
      {
        type: Schema.Types.ObjectId,
        ref: "ActiveOffer",
      },
    ],
    stock: {
      type: String,
      default: 0,
    },
    specifications: [
      {
        heading: String,
        specificationitems: [
          {
            description: String,
          },
        ],
      },
    ],
    mainImageVariant: {
      type: Schema.Types.ObjectId,
      ref: "imageVariantSchema", // referencing the imageVariantSchema directly
    },
    subImageVariants: [imageVariantSchema],
  },
  { timestamps: true }
);

productSchema.plugin(mongooseAggregatePaginate);

export const Product = mongoose.model("Product", productSchema);
