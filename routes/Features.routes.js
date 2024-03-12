import { Router } from "express";
import {
  verifyJWT,
  verifyPermission,
} from "../middlewares/auth.middlewares.js";
import { UserRolesEnum } from "../constants.js";
import { featuresRequestBodyValidator } from "../validators/features.validators.js";
import { validate } from "../validators/validate.js";
import {
  createFeature,
  deleteFeature,
  getAllFeature,
  getFeatureById,
  updateFeature,
} from "../controllers/features.controllers.js";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb.validators.js";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    featuresRequestBodyValidator(),
    validate,
    createFeature
  )
  .get(getAllFeature);

router
  .route("/:featuresId")
  .get(mongoIdPathVariableValidator("featuresId"), validate, getFeatureById)
  .delete(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("featuresId"),
    validate,
    deleteFeature
  )
  .patch(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    featuresRequestBodyValidator(),
    mongoIdPathVariableValidator("featuresId"),
    validate,
    updateFeature
  );

export default router;
