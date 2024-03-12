import { asyncHandler } from "../utils/asyncHandler.js";
import { Color } from "../models/colors.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getMongoosePaginationOptions } from "../utils/helpers.js";
import { ApiError } from "../utils/ApiError.js";

const createColor = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const color = await Color.create({name, owner: req.user._id});

    return res.status(201).json(new ApiResponse(200, color, "Color created successfully"));
});

const getAllColor = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.body;

    const colorAggregate = Color.aggregate([
        {
            $match: {}
        }
    ]);

    const colors = await Color.aggregatePaginate(colorAggregate, getMongoosePaginationOptions({
        page, limit, customLabels: {
            totalDocs: "totalColors",
            docs: "colors",
        }
    }))

    return res.status(201).json(new ApiResponse(200, colors, "Colors fetched successfully"));
});

const getColorById = asyncHandler(async (req, res) => {
    const { colorId } = req.params;

    const color = await Color.findById(colorId);;

    if(!color) {
        throw new ApiError(404, "Color does not exist");
    }

    return res.status(200).json(new ApiResponse(200, color, "Color fetched successfully"))
});

const deleteColor = asyncHandler(async (req, res) => {
    const { colorId } = req.params;

    const color = await Color.findByIdAndDelete(colorId);;

    if(!color) {
        throw new ApiError(404, "Color does not exist");
    }

    return res.status(200).json(new ApiResponse(200, {deletedColor: color}, "Color deleted successfully"))
});


const updatecolor = asyncHandler(async (req, res) => {
    const { colorId } = req.params;
    const { name } = req.body;
    const color = await Color.findByIdAndUpdate(colorId, {
        $set: {
            name,
        },
    },
    {new: true}
    )

    if(!color) {
        throw new ApiError(404, "Color does not exist");
    }

    return res.status(200).json(new ApiResponse(200, color, "Color updated successfully"))
});



export {
    createColor, getAllColor, getColorById, deleteColor, updatecolor
}