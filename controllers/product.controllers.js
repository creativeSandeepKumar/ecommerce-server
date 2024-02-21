import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getLocalPath, getStaticFilePath } from "../utils/helpers.js";

const createProduct = asyncHandler(async (req, res) => {
    const { name, description, category, maxPrice, sellPrice, discountPercentage, stock, specifications, mainImageVariant, subImageVariants, activeOffers  } = req.body;

    // to make this category model
    // const categoryToBeAdded = await Category.findById(category);

    // if(!categoryToBeAdded) {
    //     throw new ApiError(404, "Category does not exist");
    // }

    if(!req.files?.mainImage || !req.files?.mainImage.length) {
        throw new ApiError(400, "Main images is required");
    }

    const mainImageUrl = getStaticFilePath(req, res.files?.mainImage[0]?.filename);


    const mainImageLocalPath = getLocalPath(req.files?.mainImage[0]?.filename);

    const subImages = req.files.subImages && req.files.subImages?.length ? req.files.subImages.map((image) => {
        const imageUrl = getStaticFilePath(req, image.filename);
        const imageLocalPath = getLocalPath(image.filename);

        console.log("check inside subimages", imageUrl, imageLocalPath)
        return {url: imageUrl, localPath: imageLocalPath}
    }) : [];

    console.log("check subImages", subImages)

    const owner = req.user._id;

    const product = await Product.create({
        name,
        description,
        stock,
        category,
        maxPrice,
        sellPrice,
        owner,
        discountPercentage,
        specifications,
        mainImage: {
            url: mainImageUrl,
            localPath: mainImageLocalPath
        },
        subImageVariants: [
            {
                name: "Green",
                colorcode: "#008000",
                images: subImages
            }
        ]
    });

    return res.status(201).json(new ApiResponse(201, product, "Product created successfully"));

});

export {
    createProduct
}