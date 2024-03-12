import { Router } from "express";
import {
  verifyJWT,
  verifyPermission,
} from "../middlewares/auth.middlewares.js";
import { UserRolesEnum } from "../constants.js";
import { noicecancellationRequestBodyValidator } from "../validators/noicecancellation.validator.js";
import { validate } from "../validators/validate.js";
import {
  createNoicecancellation,
  deleteNoicecancellation,
  getAllNoicecancellation,
  getNoicecancellationById,
  updateNoicecancellation,
} from "../controllers/noicecancellation.controllers.js";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb.validators.js";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    noicecancellationRequestBodyValidator(),
    validate,
    createNoicecancellation
  )
  .get(getAllNoicecancellation);

router
  .route("/:noicecancellationId")
  .get(mongoIdPathVariableValidator("noicecancellationId"), validate, getNoicecancellationById)
  .delete(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("noicecancellationId"),
    validate,
    deleteNoicecancellation
  )
  .patch(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    noicecancellationRequestBodyValidator(),
    mongoIdPathVariableValidator("noicecancellationId"),
    validate,
    updateNoicecancellation
  );

export default router;
