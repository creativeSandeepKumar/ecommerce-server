import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getLocalPath, getMongoosePaginationOptions, getStaticFilePath, removeLocalFile } from "../utils/helpers.js";
import { MAXIMUM_SUB_IMAGE_COUNT } from "../constants.js";
import {Category} from "../models/category.model.js"; 
import mongoose from "mongoose";


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
    // subImageVariants,
    mainImage,
    subvariants,
  } = req.body;

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
    mainImage,
    subImageVariants: subvariants
  };

  const handleRemoveLocalImage = () => {
    let localpaths = subvariants.map((variants) => {
      let images = variants.images?.map((images) => images?.localPath);
      images = [...images];
      return images;
    });

    const allurls = [...localpaths, mainImage?.localPath];

    let mainurls = [].concat(...allurls);

    mainurls.map((localurl) => {
      removeLocalFile(localurl);
    });
  }

  const existedProduct = await Product.find({name});

  if(existedProduct.length > 0) {
    handleRemoveLocalImage();
    throw new ApiError(404, "Product with this name already exists");
  }



  // Create the product in the database
  const product = await Product.create(productData);

  if(!product) {
    handleRemoveLocalImage();
    throw new ApiError(400, "Something went wrong while creating product");
  }

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
      console.log("checkFilename", req.file?.fieldname);
      
      // Return the URL of the uploaded main image in the response
      res.status(201).json(new ApiResponse(201, { url: mainImageUrl, localPath: mainImageLocalPath }, 'Main image uploaded successfully'));
  });

export const updateMainImage = asyncHandler( async (req, res, next) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
      // Check if main image file is included in the request
      let mainImageUrl;
      let mainImageLocalPath;


          if(req.file?.filename) {
            mainImageUrl = getStaticFilePath(req, req.file.filename);
            mainImageLocalPath = getLocalPath(req.file.filename);
            removeLocalFile(product?.mainImage?.localPath)
            } else {
              mainImageUrl = product?.mainImage?.url
              mainImageLocalPath = product?.mainImage?.localPath
            }
      // Return the URL of the uploaded main image in the response
      res.status(201).json(new ApiResponse(201, { url: mainImageUrl, localPath: mainImageLocalPath }, 'Main image uploaded successfully'));
  });

  export const updateSubImages = asyncHandler( async (req, res, next) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);


   let subImages = req.files && req.files?.length ? req.files.map((image) => {
  const imageUrl = getStaticFilePath(req, image.filename);
  const imageLocalPath = getLocalPath(image.filename);

  return {url: imageUrl, localPath: imageLocalPath}
}) : [];

  const existedSubImages = product.subImageVariants?.images.length;

  const newSubImages = subImages.length;

  const totalSubImages = existedSubImages + newSubImages;

  if(totalSubImages > MAXIMUM_SUB_IMAGE_COUNT) {
    subImages?.map((img) => removeLocalFile(img.localPath));

    throw new ApiError(400, "MAXIMUM " + MAXIMUM_SUB_IMAGE_COUNT + " sub images are allowed for a product. There are alreday " + existedSubImages + " sub images attached to this variant");
  };

  subImages = [...product?.subImageVariants?.images, ...subImages];


// Return the URLs of the uploaded sub-images in the response
res.status(201).json(new ApiResponse(201, subImages, 'Sub-images updated successfully'));
});

export const getAllProducts = asyncHandler(async(req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const productAggregate = Product.aggregate([{
    $match: {}
  }]);

  const products = await Product.aggregatePaginate(productAggregate, getMongoosePaginationOptions({page, limit, customLabels: {
    totalDocs: "totalProducts",
    docs: "products",
  }}));
  
  return res.status(200).json(new ApiResponse(200, products, "Products fetched successfully"));

});

const getProductById = asyncHandler(async(req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);

  if(!product) {
    throw new ApiError(404, "Product does not exist");
  }

  return res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));

});

const updateProduct = asyncHandler(async(req, res) => {
  const { productId } = req.params;
  const {  category,
    description,
    name,
    maxPrice,
    sellPrice,
    discountPercentage,
    stock,
    specifications,
    activeOffers,
    subImageVariants } = req.body;

  const product = await Product.findById(productId);

  if(!product) {
    throw new ApiError(404, "Product does not exist")
  }

  // go in create main image and check main image and if new image uploaded then update url else keep old image
    // Add the main image URL to the product data (assuming it's already uploaded and available in the request body)
    let mainImage;
    if (req.body.mainImage) {
      mainImage = req.body.mainImage;
    }
  
    // Add the sub-images URLs to the product data (assuming they're already uploaded and available in the request body)
    let subImages;
    if (subImageVariants.images.length > 0) {
      subImages = subImageVariants.images;
    }

  const existedSubImages = product.subImageVariants[0]?.images.length;

  const newSubImages = subImages.length;

  const totalSubImages = existedSubImages + newSubImages;

  if(totalSubImages > MAXIMUM_SUB_IMAGE_COUNT) {
    console.log("check local path here", subImages?.map((img) => img.localPath));
    subImages?.map((img) => removeLocalFile(img.localPath));

    removeLocalFile(mainImage.localPath);

    throw new ApiError(400, "MAXIMUM " + MAXIMUM_SUB_IMAGE_COUNT + " sub images are allowed for a product. There are alreday " + existedSubImages + " sub images attached to this variant");
  };

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
    subImageVariants: [subImageVariants]
  };

  
  subImages = [...product?.subImageVariants[0]?.images, ...subImages];
  
  productData.mainImage = mainImage;
  productData.subImageVariants[0].images = subImages

  const updatedProduct = await Product.findByIdAndUpdate(productId, {
    $set: productData
  });

  if(product.mainImage.url !== mainImage.url) {
    removeLocalFile(product.mainImage.localPath);
  }

  return res.status(200).json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
  
});

const deleteProduct = asyncHandler(async (req, res) => {

  const { productId } = req.params;

  const product = await Product.findOneAndDelete({
    _id: productId
  });

  if(!product) {
    throw new ApiError(404, "Product does not exist");
  }

  const subImages = product.subImageVariants?.map((subimages) => subimages.images).flatMap((images) => images)

  const productImages = [product.mainImage, ...subImages];

  productImages.map((image) => {
    removeLocalFile(image.localPath);
  });

  return res.status(200).json(new ApiResponse(200, { deletedProduct: product }, "Product deleted successfully"));
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const category = await Category.findById(categoryId).select("name _id");

  if(!category) {
    throw new ApiError(404, "Category does not exist");
  }

  const productAggregate = Product.aggregate([
    {
      $match: {
        category: new mongoose.Types.ObjectId(categoryId),
      }
    }
  ]);

  const products = await Product.aggregatePaginate(productAggregate, getMongoosePaginationOptions({
    page,
    limit,
    customLabels: {
      totalDocs: "TotalProducts",
      docs: "products",
    }
  }));

  return res.status(200).json(new ApiResponse(200, {...products, category}, "Category products fetched successfully"));

});

const removeProductSubVariants = asyncHandler(async (req, res) => {
  const {productId, subImageVariantsId} = req.params;

  const product = await Product.findById(productId);

  if(!product) {
    throw new ApiError(400, "product does not exist");
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      $pull: {
        subImageVariants: {
          _id: new mongoose.Types.ObjectId(subImageVariantsId),
        }
      }
    },
    {
      new: true,
    }
  );

  const removedSubImageVariants = product.subImageVariants?.find((images) => {
    return images._id.toString() === subImageId;
  });

  

  if(removedSubImageVariants) {
    removeLocalFile(removedSubImageVariants.localPath);
  }

  return res.status(200).json(new ApiResponse(200, updatedProduct, "Sub images removed successfully"));

})

export { createProduct, getProductById, updateProduct, deleteProduct, getProductsByCategory, removeProductSubVariants };
