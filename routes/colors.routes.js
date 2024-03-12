import { Router } from "express";
import {
  verifyJWT,
  verifyPermission,
} from "../middlewares/auth.middlewares.js";
import { UserRolesEnum } from "../constants.js";
import { colorRequestBodyValidator } from "../validators/color.validator.js";
import { validate } from "../validators/validate.js";
import {
  createColor,
  getAllColor,
  getColorById,
  updatecolor,
  deleteColor
} from "../controllers/color.controllers.js";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb.validators.js";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    colorRequestBodyValidator(),
    validate,
    createColor
  )
  .get(getAllColor);

router
  .route("/:colorId")
  .get(mongoIdPathVariableValidator("colorId"), validate, getColorById)
  .delete(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("colorId"),
    validate,
    deleteColor
  )
  .patch(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    colorRequestBodyValidator(),
    mongoIdPathVariableValidator("colorId"),
    validate,
    updatecolor
  );

export default router;
