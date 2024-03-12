import { Router } from "express";
import {
  verifyJWT,
  verifyPermission,
} from "../middlewares/auth.middlewares.js";
import { UserRolesEnum } from "../constants.js";
import { bestForRequestBodyValidator } from "../validators/bestFor.validator.js";
import { validate } from "../validators/validate.js";
import {
  createBestfor,
  deleteBestfor,
  getAllBestfor,
  getBestforById,
  updateBestfor,
} from "../controllers/bestFor.controllers.js";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb.validators.js";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    bestForRequestBodyValidator(),
    validate,
    createBestfor
  )
  .get(getAllBestfor);

router
  .route("/:bestforId")
  .get(mongoIdPathVariableValidator("bestforId"), validate, getBestforById)
  .delete(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("bestforId"),
    validate,
    deleteBestfor
  )
  .patch(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    bestForRequestBodyValidator(),
    mongoIdPathVariableValidator("bestforId"),
    validate,
    updateBestfor
  );

export default router;
