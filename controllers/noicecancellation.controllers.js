import { asyncHandler } from "../utils/asyncHandler.js";
import { Noicecancellation } from "../models/noicecancellation.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getMongoosePaginationOptions } from "../utils/helpers.js";
import { ApiError } from "../utils/ApiError.js";

const createNoicecancellation = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const noicecancellation = await Noicecancellation.create({name, owner: req.user._id});

    return res.status(201).json(new ApiResponse(200, noicecancellation, "Noicecancellation created successfully"));
});

const getAllNoicecancellation = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.body;

    const noicecancellationAggregate = Noicecancellation.aggregate([
        {
            $match: {}
        }
    ]);

    const noicecancellation = await Noicecancellation.aggregatePaginate(noicecancellationAggregate, getMongoosePaginationOptions({
        page, limit, customLabels: {
            totalDocs: "totalNoicecancellation",
            docs: "noicecancellation",
        }
    }))

    return res.status(201).json(new ApiResponse(200, noicecancellation, "Noicecancellation fetched successfully"));
});

const getNoicecancellationById = asyncHandler(async (req, res) => {
    const {  noicecancellationId  } = req.params;

    const noicecancellation = await Noicecancellation.findById( noicecancellationId );;

    if( !noicecancellation ) {
        throw new ApiError(404, "Noicecancellation does not exist");
    }

    return res.status(200).json(new ApiResponse(200, noicecancellation, "Noicecancellation fetched successfully"))
});

const deleteNoicecancellation = asyncHandler(async (req, res) => {
    const {  noicecancellationId  } = req.params;

    const noicecancellation = await Noicecancellation.findByIdAndDelete( noicecancellationId );;

    if( !noicecancellation ) {
        throw new ApiError(404, "Noicecancellation does not exist");
    }

    return res.status(200).json(new ApiResponse(200, {deletedNoicecancellation: noicecancellation}, "Noicecancellation deleted successfully"))
});


const updateNoicecancellation = asyncHandler(async (req, res) => {
    const {  noicecancellationId  } = req.params;
    const { name } = req.body;
    const noicecancellation = await Noicecancellation.findByIdAndUpdate( noicecancellationId , {
        $set: {
            name,
        },
    },
    {new: true}
    )

    if( !noicecancellation ) {
        throw new ApiError(404, "Noicecancellation does not exist");
    }

    return res.status(200).json(new ApiResponse(200, noicecancellation, "Noicecancellation updated successfully"))
});



export {
    createNoicecancellation, getAllNoicecancellation, getNoicecancellationById, deleteNoicecancellation, updateNoicecancellation
}