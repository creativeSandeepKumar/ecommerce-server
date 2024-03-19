import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const colorSchema = new Schema(
    {
       name: {
        type: String,
        required: true,
    },
       colorCode: {
        type: String,
        required: true,
    },
       owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, {timestamps: true}
);

colorSchema.plugin(mongooseAggregatePaginate);

export const Color = mongoose.model("Color", colorSchema);