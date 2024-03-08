import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const activeOfferSchema = new Schema(
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

activeOfferSchema.plugin(mongooseAggregatePaginate);

export const Activeoffer = mongoose.model("Activeoffer", activeOfferSchema);