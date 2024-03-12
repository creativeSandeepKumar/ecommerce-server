import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playbackSchema = new Schema(
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

playbackSchema.plugin(mongooseAggregatePaginate);

export const Playback = mongoose.model("Playback", playbackSchema);