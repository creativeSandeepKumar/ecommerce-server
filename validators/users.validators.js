import { body } from "express-validator";
import { AvailableUserRoles } from "../constants.js";

const registerUserValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("password").trim().notEmpty().withMessage("Password is required"),
    body("role")
      .optional()
      .isIn(AvailableUserRoles)
      .withMessage("Invalid user role"),
  ];
};

const userLoginValidator = () => {
  return [
    body("email").optional().isEmail().withMessage("Email is required"),
    body("username").optional(),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};


const userForgotPasswordValidator = () => {
  return [
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Email is invalid"),
  ];
};
const userResetForgottenPasswordValidator = () => {
  return [
    body("newPassword").notEmpty().withMessage("Password is required")
  ];
};

const userChangeCurrentPasswordValidator = () => {
  return [
    body("newPassword").notEmpty().withMessage("New Password is required"),
    body("oldPassword").notEmpty().withMessage("Old Password is required"),
  ];
};

const userAssignRoleValidator = () => {
  return [
    body("role").optional().isIn(AvailableUserRoles).withMessage("Inavlid user role"),
  ]
}


export { registerUserValidator, userLoginValidator, userForgotPasswordValidator, userResetForgottenPasswordValidator, userChangeCurrentPasswordValidator , userAssignRoleValidator};
