import { asyncHandler } from "../utils/asyncHandler.js";
import { Category } from "../models/category.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getMongoosePaginationOptions } from "../utils/helpers.js";
import { ApiError } from "../utils/ApiError.js";

const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const category = await Category.create({name, owner: req.user._id});

    return res.status(201).json(new ApiResponse(200, category, "Category created successfully"));
});

const getAllCategories = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.body;

    const categoryAggregate = Category.aggregate([
        {
            $match: {}
        }
    ]);

    const categories = await Category.aggregatePaginate(categoryAggregate, getMongoosePaginationOptions({
        page, limit, customLabels: {
            totalDocs: "totalCategories",
            docs: "categories",
        }
    }))

    return res.status(201).json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

const getCategoryById = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);;

    if(!category) {
        throw new ApiError(404, "Category does not exist");
    }

    return res.status(200).json(new ApiResponse(200, category, "Category fetched successfully"))
});

const deleteCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    const category = await Category.findByIdAndDelete(categoryId);;

    if(!category) {
        throw new ApiError(404, "Category does not exist");
    }

    return res.status(200).json(new ApiResponse(200, {deletedCategory: category}, "Category deleted successfully"))
});


const updatecategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { name } = req.body;
    const category = await Category.findByIdAndUpdate(categoryId, {
        $set: {
            name,
        },
    },
    {new: true}
    )

    if(!category) {
        throw new ApiError(404, "Category does not exist");
    }

    return res.status(200).json(new ApiResponse(200, category, "Category updated successfully"))
});



export {
    createCategory, getAllCategories, getCategoryById, deleteCategory, updatecategory
}