import { body } from "express-validator";

const createAddressValidator = () => {
    return [
        body("addressLine1")
        .trim()
        .notEmpty()
        .withMessage("Address Line 1 is required"),
        body("city")
        .trim()
        .notEmpty()
        .withMessage("City is required"),
        body("country")
        .trim()
        .notEmpty()
        .withMessage("country is required"),
        body("pincode")
        .trim()
        .notEmpty()
        .withMessage("pincode is required")
        .isNumeric()
        .isLength({ max: 6, min: 6 })
        .withMessage("Invalid pincode"),
        body("state")
        .trim()
        .notEmpty()
        .withMessage("state is required"),
    ]
}

const updateAddressValidator = () => {
    return [
        body("addressLine1")
        .trim()
        .notEmpty()
        .withMessage("Address Line 1 is required"),
        body("city")
        .trim()
        .notEmpty()
        .withMessage("City is required"),
        body("country")
        .trim()
        .notEmpty()
        .withMessage("country is required"),
        body("pincode")
        .trim()
        .notEmpty()
        .withMessage("pincode is required")
        .isNumeric()
        .isLength({ max: 6, min: 6 })
        .withMessage("Invalid pincode"),
        body("state")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("state is required"),
    ]
}

export {
    createAddressValidator,
    updateAddressValidator
}