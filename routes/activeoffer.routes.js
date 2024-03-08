import { Router } from "express";
import {
  verifyJWT,
  verifyPermission,
} from "../middlewares/auth.middlewares.js";
import { UserRolesEnum } from "../constants.js";
import { activeofferRequestBodyValidator } from "../validators/activeoffer.validator.js";
import { validate } from "../validators/validate.js";
import {
 createActiveOffer,
 deleteActiveoffer,
 getActiveofferById,
 getAllActiveOffers,
 updateactiveoffer
} from "../controllers/activeoffer.controllers.js";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb.validators.js";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    activeofferRequestBodyValidator(),
    validate,
    createActiveOffer
  )
  .get(getAllActiveOffers);

router
  .route("/:activeofferId")
  .get(mongoIdPathVariableValidator("activeofferId"), validate, getActiveofferById)
  .delete(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("activeofferId"),
    validate,
    deleteActiveoffer
  )
  .patch(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    activeofferRequestBodyValidator(),
    mongoIdPathVariableValidator("activeofferId"),
    validate,
    updateactiveoffer
  );

export default router;
