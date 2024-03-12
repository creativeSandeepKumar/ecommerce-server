import { Router } from "express";
import {
  verifyJWT,
  verifyPermission,
} from "../middlewares/auth.middlewares.js";
import { UserRolesEnum } from "../constants.js";
import { playbackRequestBodyValidator } from "../validators/playback.validator.js";
import { validate } from "../validators/validate.js";
import {
  createPlayback,
  deletePlayback,
  getAllPlayback,
  getPlaybackById,
  updatePlayback,
} from "../controllers/playback.controllers.js";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb.validators.js";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    playbackRequestBodyValidator(),
    validate,
    createPlayback
  )
  .get(getAllPlayback);

router
  .route("/:PlaybackId")
  .get(mongoIdPathVariableValidator("PlaybackId"), validate, getPlaybackById)
  .delete(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("PlaybackId"),
    validate,
    deletePlayback
  )
  .patch(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    playbackRequestBodyValidator(),
    mongoIdPathVariableValidator("PlaybackId"),
    validate,
    updatePlayback
  );

export default router;
