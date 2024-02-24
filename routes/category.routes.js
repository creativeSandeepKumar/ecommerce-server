import { Router } from "express";
import {
  verifyJWT,
  verifyPermission,
} from "../middlewares/auth.middlewares.js";
import { UserRolesEnum } from "../constants.js";
import { categoryRequestBodyValidator } from "../validators/category.validators.js";
import { validate } from "../validators/validate.js";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updatecategory,
} from "../controllers/category.controllers.js";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb.validators.js";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    categoryRequestBodyValidator(),
    validate,
    createCategory
  )
  .get(getAllCategories);

router
  .route("/:categoryId")
  .get(mongoIdPathVariableValidator("categoryId"), validate, getCategoryById)
  .delete(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("categoryId"),
    validate,
    deleteCategory
  )
  .patch(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    categoryRequestBodyValidator(),
    mongoIdPathVariableValidator("categoryId"),
    validate,
    updatecategory
  );

export default router;
