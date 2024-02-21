import { Router } from "express";
import { createProductValidator } from "../validators/product.validators.js"
import { MAXIMUM_SUB_IMAGE_COUNT, verifyJWT, verifyPermission } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { UserRolesEnum } from "../constants.js";
import { validate } from "../validators/validate.js";
import { createProduct } from "../controllers/product.controllers.js";

const router = Router();

router.route("/").post(verifyJWT, verifyPermission([UserRolesEnum.ADMIN]), upload.fields([
    {
        name: "mainImage",
        maxCount: 1,
    },
    {
        name: "subImages",
        maxCount: MAXIMUM_SUB_IMAGE_COUNT,
    },
]), createProductValidator(), validate, createProduct)

export default router;