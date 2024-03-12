import { asyncHandler } from "../utils/asyncHandler.js";
import { Dialshape } from "../models/dialshape.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getMongoosePaginationOptions } from "../utils/helpers.js";
import { ApiError } from "../utils/ApiError.js";

const createDialshape = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const dialshape = await Dialshape.create({name, owner: req.user._id});

    return res.status(201).json(new ApiResponse(200, dialshape, "Dialshape created successfully"));
});

const getAllDialshape = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.body;

    const dialshapeAggregate = Dialshape.aggregate([
        {
            $match: {}
        }
    ]);

    const dialshape = await Dialshape.aggregatePaginate(dialshapeAggregate, getMongoosePaginationOptions({
        page, limit, customLabels: {
            totalDocs: "totalDialshape",
            docs: "dialshape",
        }
    }))

    return res.status(201).json(new ApiResponse(200, dialshape, "Dialshape fetched successfully"));
});

const getDialshapeById = asyncHandler(async (req, res) => {
    const {  dialshapeId  } = req.params;

    const dialshape = await Dialshape.findById( dialshapeId );;

    if( !dialshape ) {
        throw new ApiError(404, "Dialshape does not exist");
    }

    return res.status(200).json(new ApiResponse(200, dialshape, "Dialshape fetched successfully"))
});

const deleteDialshape = asyncHandler(async (req, res) => {
    const {  dialshapeId  } = req.params;

    const dialshape = await Dialshape.findByIdAndDelete( dialshapeId );;

    if( !dialshape ) {
        throw new ApiError(404, "Dialshape does not exist");
    }

    return res.status(200).json(new ApiResponse(200, {deletedDialshape: dialshape}, "Dialshape deleted successfully"))
});


const updateDialshape = asyncHandler(async (req, res) => {
    const {  dialshapeId  } = req.params;
    const { name } = req.body;
    const dialshape = await Dialshape.findByIdAndUpdate( dialshapeId , {
        $set: {
            name,
        },
    },
    {new: true}
    )

    if( !dialshape ) {
        throw new ApiError(404, "Dialshape does not exist");
    }

    return res.status(200).json(new ApiResponse(200, dialshape, "Dialshape updated successfully"))
});



export {
    createDialshape, getAllDialshape, getDialshapeById, deleteDialshape, updateDialshape
}