import { Router } from "express";
import { verifyJWT, verifyPermission } from "../middlewares/auth.middlewares.js";
import { UserRolesEnum } from "../constants";
import { categoryRequestBodyValidator } from "../validators/category.validators.js";
import { validate } from "../validators/validate.js";

const router = Router();

router.route("/").post(verifyJWT, verifyPermission([UserRolesEnum.ADMIN]), categoryRequestBodyValidator(), validate, createCategory);

export default router;