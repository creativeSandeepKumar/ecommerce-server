import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const featuresSchema = new Schema(
    {
       name: {
        type: String,
        required: true,
    },
       owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, {timestamps: true}
);

featuresSchema.plugin(mongooseAggregatePaginate);

export const Feature = mongoose.model("Feature", featuresSchema);