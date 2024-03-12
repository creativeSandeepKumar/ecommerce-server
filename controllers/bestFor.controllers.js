import { asyncHandler } from "../utils/asyncHandler.js";
import { Bestfor } from "../models/bestFor.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getMongoosePaginationOptions } from "../utils/helpers.js";
import { ApiError } from "../utils/ApiError.js";

const createBestfor = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const bestfor = await Bestfor.create({name, owner: req.user._id});

    return res.status(201).json(new ApiResponse(200, bestfor, "Bestfor created successfully"));
});

const getAllBestfor = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.body;

    const bestforAggregate = Bestfor.aggregate([
        {
            $match: {}
        }
    ]);

    const bestfor = await Bestfor.aggregatePaginate(bestforAggregate, getMongoosePaginationOptions({
        page, limit, customLabels: {
            totalDocs: "totalBestfor",
            docs: "bestfor",
        }
    }))

    return res.status(201).json(new ApiResponse(200, bestfor, "Bestfor fetched successfully"));
});

const getBestforById = asyncHandler(async (req, res) => {
    const {  bestforId  } = req.params;

    const bestfor = await Bestfor.findById( bestforId );;

    if( !bestfor ) {
        throw new ApiError(404, "Bestfor does not exist");
    }

    return res.status(200).json(new ApiResponse(200, bestfor, "Bestfor fetched successfully"))
});

const deleteBestfor = asyncHandler(async (req, res) => {
    const {  bestforId  } = req.params;

    const bestfor = await Bestfor.findByIdAndDelete( bestforId );;

    if( !bestfor ) {
        throw new ApiError(404, "Bestfor does not exist");
    }

    return res.status(200).json(new ApiResponse(200, {deletedBestfor: bestfor}, "Bestfor deleted successfully"))
});


const updateBestfor = asyncHandler(async (req, res) => {
    const {  bestforId  } = req.params;
    const { name } = req.body;
    const bestfor = await Bestfor.findByIdAndUpdate( bestforId , {
        $set: {
            name,
        },
    },
    {new: true}
    )

    if( !bestfor ) {
        throw new ApiError(404, "Bestfor does not exist");
    }

    return res.status(200).json(new ApiResponse(200, bestfor, "Bestfor updated successfully"))
});



export {
    createBestfor, getAllBestfor, getBestforById, deleteBestfor, updateBestfor
}