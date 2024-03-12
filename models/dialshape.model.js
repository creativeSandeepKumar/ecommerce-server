import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const dialShapeSchema = new Schema(
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

dialShapeSchema.plugin(mongooseAggregatePaginate);

export const Dialshape = mongoose.model("Dialshape", dialShapeSchema);