import { asyncHandler } from "../utils/asyncHandler.js";
import { Category } from "../models/category.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const category = await Category.create({name, owner: req.user._id});

    return res.status(201).json(new ApiResponse(200, category, "Category created successfully"));
})