import { asyncHandler } from "../utils/asyncHandler.js";
import { Playback } from "../models/playback.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getMongoosePaginationOptions } from "../utils/helpers.js";
import { ApiError } from "../utils/ApiError.js";

const createPlayback = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const playback = await Playback.create({name, owner: req.user._id});

    return res.status(201).json(new ApiResponse(200, playback, "Playback created successfully"));
});

const getAllPlayback = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.body;

    const playbackAggregate = Playback.aggregate([
        {
            $match: {}
        }
    ]);

    const playback = await Playback.aggregatePaginate(playbackAggregate, getMongoosePaginationOptions({
        page, limit, customLabels: {
            totalDocs: "totalPlayback",
            docs: "playback",
        }
    }))

    return res.status(201).json(new ApiResponse(200, playback, "Playback fetched successfully"));
});

const getPlaybackById = asyncHandler(async (req, res) => {
    const {  PlaybackId  } = req.params;

    const playback = await Playback.findById( PlaybackId );;

    if( !playback ) {
        throw new ApiError(404, "Playback does not exist");
    }

    return res.status(200).json(new ApiResponse(200, playback, "Playback fetched successfully"))
});

const deletePlayback = asyncHandler(async (req, res) => {
    const {  PlaybackId  } = req.params;

    const playback = await Playback.findByIdAndDelete( PlaybackId );;

    if( !playback ) {
        throw new ApiError(404, "Playback does not exist");
    }

    return res.status(200).json(new ApiResponse(200, {deletedPlayback: playback}, "Playback deleted successfully"))
});


const updatePlayback = asyncHandler(async (req, res) => {
    const {  PlaybackId  } = req.params;
    const { name } = req.body;
    const playback = await Playback.findByIdAndUpdate( PlaybackId , {
        $set: {
            name,
        },
    },
    {new: true}
    )

    if( !playback ) {
        throw new ApiError(404, "Playback does not exist");
    }

    return res.status(200).json(new ApiResponse(200, playback, "Playback updated successfully"))
});



export {
    createPlayback, getAllPlayback, getPlaybackById, deletePlayback, updatePlayback
}