import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getLocalPath, getStaticFilePath } from "../utils/helpers.js";

// const createProduct = asyncHandler(async (req, res) => {
//     const { name, description, category, maxPrice, sellPrice, discountPercentage, stock, specifications, mainImageVariant, subImageVariants, activeOffers  } = req.body;

//     // to make this category model
//     // const categoryToBeAdded = await Category.findById(category);

//     // if(!categoryToBeAdded) {
//     //     throw new ApiError(404, "Category does not exist");
//     // }
//     console.log("check subImages", req?.files)
//     if(!req.files?.mainImage || !req.files?.mainImage.length) {
//         throw new ApiError(400, "Main images is required");
//     }

//     const mainImageUrl = getStaticFilePath(req, res.files?.mainImage[0]?.filename);

//     const mainImageLocalPath = getLocalPath(req.files?.mainImage[0]?.filename);

//     const subImages = req.files.subImages && req.files.subImages?.length ? req.files.subImages.map((image) => {
//         const imageUrl = getStaticFilePath(req, image.filename);
//         const imageLocalPath = getLocalPath(image.filename);

//         return {url: imageUrl, localPath: imageLocalPath}
//     }) : [];

//     const owner = req.user._id;

//     const product = await Product.create({
//         name,
//         description,
//         stock,
//         category,
//         maxPrice,
//         sellPrice,
//         owner,
//         discountPercentage,
//         specifications,
//         mainImage: {
//             url: mainImageUrl,
//             localPath: mainImageLocalPath
//         },
//         subImageVariants: [
//             {
//                 name: "Green",
//                 colorcode: "#008000",
//                 images: subImages
//             }
//         ]
//     });

//     return res.status(201).json(new ApiResponse(201, product, "Product created successfully"));

// });
const createProduct = asyncHandler(async (req, res) => {
  // Destructure the required fields from the request body
  const {
    category,
    description,
    name,
    maxPrice,
    sellPrice,
    discountPercentage,
    stock,
    specifications,
    activeOffers,
    subImageVariants,
  } = req.body;

  // Check if the required fields are present
  if (
    !category ||
    !description ||
    !name ||
    !maxPrice ||
    !sellPrice ||
    !stock ||
    !specifications ||
    !subImageVariants
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Required fields are missing"));
  }

  // Construct the product object with the required fields
  const productData = {
    category,
    description,
    name,
    maxPrice,
    sellPrice,
    discountPercentage,
    stock,
    specifications,
    activeOffers,
    subImageVariants
  };

  // Add the main image URL to the product data (assuming it's already uploaded and available in the request body)
  if (req.body.mainImage) {
    productData.mainImage = req.body.mainImage;
  }

  // Add the sub-images URLs to the product data (assuming they're already uploaded and available in the request body)
  if (req.body.subImages) {
    productData.subImages = req.body.subImages;
  }

  // Create the product in the database
  const product = await Product.create(productData);

  // Respond with success message and created product data
  res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

// Controller for uploading sub-images
export const createSubImages = asyncHandler( async (req, res, next) => {
 
      // Check if sub-images files are included in the request
      if (!req.files || req.files.length === 0) {
        throw new ApiError(400, 'Sub-images files are required')
      }
  
    //   const subImageUrls = [];
      
      // Here, you can handle the upload of each sub-image using any storage service (local file system, cloud storage, etc.)
      // For example, if you're using a local file system:
    //   for (const file of req.files) {
    //     const subImageUrl = `/uploads/${file.filename}`; // Assuming uploads directory for storing sub-images
    //     subImageUrls.push(subImageUrl);
    //   }

          const subImages = req.files && req.files?.length ? req.files.map((image) => {
        const imageUrl = getStaticFilePath(req, image.filename);
        const imageLocalPath = getLocalPath(image.filename);

        return {url: imageUrl, localPath: imageLocalPath}
    }) : [];
  
      // Return the URLs of the uploaded sub-images in the response
      res.status(201).json(new ApiResponse(201, subImages?.[0], 'Sub-images uploaded successfully'));
  });

  // Controller for uploading the main image
export const createMainImage = asyncHandler( async (req, res, next) => {

      // Check if main image file is included in the request
          if(!req.file?.filename) {
                throw new ApiError(400, "Main images is required");
            }
        
            const mainImageUrl = getStaticFilePath(req, req.file.filename);
        
            const mainImageLocalPath = getLocalPath(req.file.filename);
      if (!req.file) {
        throw new ApiError(400, null, 'Main image file is required')
      }
  
      // Here, you can handle the main image upload using any storage service (local file system, cloud storage, etc.)
      // For example, if you're using a local file system:
    //   const mainImageUrl = `/uploads/${req.file.filename}`; // Assuming uploads directory for storing main images
      
      // Return the URL of the uploaded main image in the response
      res.status(201).json(new ApiResponse(201, { url: mainImageUrl, localPath: mainImageLocalPath }, 'Main image uploaded successfully'));
  });

export { createProduct };
