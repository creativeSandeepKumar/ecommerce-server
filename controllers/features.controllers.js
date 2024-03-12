import { asyncHandler } from "../utils/asyncHandler.js";
import { Feature } from "../models/features.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getMongoosePaginationOptions } from "../utils/helpers.js";
import { ApiError } from "../utils/ApiError.js";

const createFeature = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const feature = await Feature.create({name, owner: req.user._id});

    return res.status(201).json(new ApiResponse(200, feature, "Feature created successfully"));
});

const getAllFeature = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.body;

    const featureAggregate = Feature.aggregate([
        {
            $match: {}
        }
    ]);

    const feature = await Feature.aggregatePaginate(featureAggregate, getMongoosePaginationOptions({
        page, limit, customLabels: {
            totalDocs: "totalFeature",
            docs: "feature",
        }
    }))

    return res.status(201).json(new ApiResponse(200, feature, "Feature fetched successfully"));
});

const getFeatureById = asyncHandler(async (req, res) => {
    const {  featuresId  } = req.params;

    const feature = await Feature.findById( featuresId );;

    if( !feature ) {
        throw new ApiError(404, "Feature does not exist");
    }

    return res.status(200).json(new ApiResponse(200, feature, "Feature fetched successfully"))
});

const deleteFeature = asyncHandler(async (req, res) => {
    const {  featuresId  } = req.params;

    const feature = await Feature.findByIdAndDelete( featuresId );;

    if( !feature ) {
        throw new ApiError(404, "Feature does not exist");
    }

    return res.status(200).json(new ApiResponse(200, {deletedFeature: feature}, "Feature deleted successfully"))
});


const updateFeature = asyncHandler(async (req, res) => {
    const {  featuresId  } = req.params;
    const { name } = req.body;
    const feature = await Feature.findByIdAndUpdate( featuresId , {
        $set: {
            name,
        },
    },
    {new: true}
    )

    if( !feature ) {
        throw new ApiError(404, "Feature does not exist");
    }

    return res.status(200).json(new ApiResponse(200, feature, "Feature updated successfully"))
});



export {
    createFeature, getAllFeature, getFeatureById, deleteFeature, updateFeature
}