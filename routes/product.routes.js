import { Router } from "express";
import { createProductValidator } from "../validators/product.validators.js"
import { MAXIMUM_SUB_IMAGE_COUNT, verifyJWT, verifyPermission } from "../middlewares/auth.middlewares.js";
import { upload, uploadMainImage, uploadSubImages } from "../middlewares/multer.middlewares.js";
import { UserRolesEnum } from "../constants.js";
import { validate } from "../validators/validate.js";
import { createMainImage, createProduct, createSubImages } from "../controllers/product.controllers.js";

const router = Router();

// Route for uploading main image
router.route("/main-image").post(
  uploadMainImage,
   createMainImage
)


router.route("/sub-images").post(
  uploadSubImages, createSubImages
)

router.route("/").post(
  verifyJWT, verifyPermission([UserRolesEnum.ADMIN]),
  // createProductValidator(),
  validate, createProduct
)


export default router;
