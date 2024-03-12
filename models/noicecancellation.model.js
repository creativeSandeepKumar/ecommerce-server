import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const noiceCancellationSchema = new Schema(
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

noiceCancellationSchema.plugin(mongooseAggregatePaginate);

export const Noicecancellation = mongoose.model("Noicecancellation", noiceCancellationSchema);