import { Router } from "express";
import { createProductValidator, updateProductValidator } from "../validators/product.validators.js";
import {
  MAXIMUM_SUB_IMAGE_COUNT,
  verifyJWT,
  verifyPermission,
} from "../middlewares/auth.middlewares.js";
import {
  upload,
  uploadMainImage,
  uploadSubImages,
} from "../middlewares/multer.middlewares.js";
import { UserRolesEnum } from "../constants.js";
import { validate } from "../validators/validate.js";
import {
  createMainImage,
  createProduct,
  createSubImages,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  removeProductSubVariants,
  updateProduct,
} from "../controllers/product.controllers.js";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb.validators.js";

const router = Router();

// Route for uploading main image
router.route("/main-image").post(uploadMainImage, createMainImage);

router.route("/sub-images").post(uploadSubImages, createSubImages);

router
  .route("/")
  .get(getAllProducts)
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    createProductValidator(),
    validate,
    createProduct
  );

router
  .route("/:productId")
  .get(mongoIdPathVariableValidator("productId"), validate, getProductById)
  .patch(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("productId"), 
    // updateProductValidator(),
    validate,
    updateProduct
  )
  .delete(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("productId"), 
    // updateProductValidator(),
    validate,
    deleteProduct
  );

  router.route("/category/:categoryId").get(mongoIdPathVariableValidator("categoryId"), validate, getProductsByCategory);


  router.route("/remove/subimage/:productId/:subImageVariantsId").patch(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("productId"),
    mongoIdPathVariableValidator("subImageVariantsId"), validate, removeProductSubVariants);

export default router;
