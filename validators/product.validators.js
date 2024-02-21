import { body } from "express-validator";
import { mongoIdRequestBodyValidator } from "./common/mongodb.validators.js";
import { ApiError } from "../utils/ApiError.js";

const createProductValidator = () => {
  return [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isString() // Ensure name is a string
    .isLength({ min: 3, max: 50 }) // Add length restrictions with proper message
    .withMessage("Name must be between 3 and 50 characters"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isString() // Ensure description is a string
      .isLength({ min: 10, max: 200 }) // Add length restrictions with proper message
      .withMessage("Description must be between 10 and 200 characters"),
      mongoIdRequestBodyValidator("category"),
      body("maxPrice")
      .trim()
      .notEmpty()
      .withMessage("Max price is required")
      .isNumeric()
      .withMessage("Max price must be a number")
      .isFloat({ min: 0 }) // Allow decimals and enforce non-negative
      .withMessage("Max price must be non-negative"),
    body("sellPrice")
      .trim()
      .notEmpty()
      .withMessage("Sell price is required")
      .isNumeric()
      .withMessage("Sell price must be a number")
      .isFloat({ min: 0 }) // Allow decimals and enforce non-negative
      .withMessage("Sell price must be non-negative"),
    body("discountPercentage")
      .trim()
      .notEmpty()
      .withMessage("Discount percentage is required")
      .isNumeric()
      .withMessage("Discount percentage must be a number")
      .isFloat({ min: 0, max: 100 }) // Allow decimals, enforce non-negative, and limit to 0-100%
      .withMessage("Discount percentage must be between 0% and 100%"),

    // Stock
    body("stock")
      .trim()
      .notEmpty()
      .withMessage("Stock is required")
      .isNumeric()
      .withMessage("Stock must be a number")
      .isInt({ min: 0 }) // Enforce non-negative integer
      .withMessage("Stock must be a non-negative integer"),
      body("activeOffers") // Validate specifications sub-array
      .isArray() // Ensure active offers is an array
      .optional()
      .isMongoId()
      .withMessage("Actice offers inavlid id"),
      // body("specifications") // Validate specifications sub-array
      // .isArray() // Ensure specifications is an array
      // .notEmpty() // Require at least one specification
      // .custom((value) => {
      //   // Validate individual specifications
      //   for (const spec of value) {
      //     if (!spec.name || !spec.description) {
      //       throw new ApiError("Each specification must have a name and description");
      //     }

      //     // Consider adding further validation for name and description (length, format)
      //   }
      //   return true; // Specifications array is valid
      // }),
  ];
};

function imageVariantSubArrayValidator(field) {
  return body(field)
    .isArray() // Ensure it's an array
    .custom((value) => {
      // Validate each sub-document
      for (const variant of value) {
        if (!variant.name || !variant.colorCode || !variant.images) {
          throw new ApiError("Each image variant must have a name, color code, and images array");
        }

        // Consider adding further validation for name, color code, and images (length, format)
      }
      return true; // Sub
})
};

export {
    createProductValidator, imageVariantSubArrayValidator
}
