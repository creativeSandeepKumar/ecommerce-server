import { Router } from "express";
import {
  verifyJWT,
  verifyPermission,
} from "../middlewares/auth.middlewares.js";
import { UserRolesEnum } from "../constants.js";
import { dialshapeRequestBodyValidator } from "../validators/dialshape.validators.js";
import { validate } from "../validators/validate.js";
import {
  createDialshape,
  deleteDialshape,
  getAllDialshape,
  getDialshapeById,
  updateDialshape,
} from "../controllers/diapShape.controllers.js";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb.validators.js";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    dialshapeRequestBodyValidator(),
    validate,
    createDialshape
  )
  .get(getAllDialshape);

router
  .route("/:dialshapeId")
  .get(mongoIdPathVariableValidator("dialshapeId"), validate, getDialshapeById)
  .delete(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("dialshapeId"),
    validate,
    deleteDialshape
  )
  .patch(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    dialshapeRequestBodyValidator(),
    mongoIdPathVariableValidator("dialshapeId"),
    validate,
    updateDialshape
  );

export default router;
