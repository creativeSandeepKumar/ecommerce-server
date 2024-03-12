import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const bestForSchema = new Schema(
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

bestForSchema.plugin(mongooseAggregatePaginate);

export const Bestfor = mongoose.model("Bestfor", bestForSchema);