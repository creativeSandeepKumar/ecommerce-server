import { asyncHandler } from "../utils/asyncHandler.js";
import { Activeoffer } from "../models/activeoffer.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getMongoosePaginationOptions } from "../utils/helpers.js";
import { ApiError } from "../utils/ApiError.js";

const createActiveOffer = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const activeoffer = await Activeoffer.create({name, owner: req.user._id});

    return res.status(201).json(new ApiResponse(200, activeoffer, "Category created successfully"));
});

const getAllActiveOffers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.body;

    const activeofferAggregate = Activeoffer.aggregate([
        {
            $match: {}
        }
    ]);

    const activeoffers = await Activeoffer.aggregatePaginate(activeofferAggregate, getMongoosePaginationOptions({
        page, limit, customLabels: {
            totalDocs: "totalActiveoffer",
            docs: "activeoffers",
        }
    }))

    return res.status(201).json(new ApiResponse(200, activeoffers, "Active offers fetched successfully"));
});

const getActiveofferById = asyncHandler(async (req, res) => {
    const { activeofferId } = req.params;

    const activeoffer = await Activeoffer.findById(activeofferId);;

    if(!activeoffer) {
        throw new ApiError(404, "Active Offers does not exist");
    }

    return res.status(200).json(new ApiResponse(200, activeoffer, "Active Offers fetched successfully"))
});

const deleteActiveoffer = asyncHandler(async (req, res) => {
    const { activeofferId } = req.params;

    const activeoffer = await Activeoffer.findByIdAndDelete(activeofferId);;

    if(!activeoffer) {
        throw new ApiError(404, "activeoffer does not exist");
    }

    return res.status(200).json(new ApiResponse(200, {deletedActiveoffer: activeoffer}, "Active Offer deleted successfully"))
});


const updateactiveoffer = asyncHandler(async (req, res) => {
    const { activeofferId } = req.params;
    const { name } = req.body;

    const activeoffer = await Activeoffer.findByIdAndUpdate(activeofferId, {
        $set: {
            name,
        },
    },
    {new: true}
    );

    if(!activeoffer) {
        throw new ApiError(404, "Active Offer does not exist");
    }

    return res.status(200).json(new ApiResponse(200, activeoffer, "Active Offer updated successfully"))
});



export {
    createActiveOffer, getAllActiveOffers, getActiveofferById, deleteActiveoffer, updateactiveoffer
}