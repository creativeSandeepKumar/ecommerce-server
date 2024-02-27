import { body } from "express-validator"
import { AvailableCouponTypes } from "../constants.js"


const createCouponValidator = () => {
    return [
        body("name").trim().notEmpty().withMessage("Coupon name is required"),
        body("couponCode")
        .trim()
        .notEmpty()
        .withMessage("Coupon code is required")
        .isLength({ min: 4 })
        .withMessage("coupon code must be alt least 4 characters long"),
        body("type")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Coupon code is required")
        .isIn(AvailableCouponTypes)
        .withMessage("Inavlid coupon type"),
        body("discountValue")
        .trim()
        .notEmpty()
        .withMessage("Discount value is required")
        .isInt({
            min: 1,
        })
        .withMessage("Discount value must be greater than 0"),
        body("minimumCartValue")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Invalid minimum cart value")
        .isInt({
            min: 0,
        })
        .withMessage("Minimum cart value can not be negative"),
        body("startDate")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Start date is required")
        .isISO8601()
        .withMessage("Invalid start date. Date must be in ISO8601 format"),
        body("expiryDate")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Expiry date is required")
        .isISO8601()
        .withMessage("Invalid expiry date. Date must be in ISO8601 format"),
    ]
}

const applyCouponCodeValidator = () => {
    return [
        body("couponCode")
        .trim()
        .notEmpty()
        .withMessage("Coupon code is required")
        .isLength({ min: 4 })
        .withMessage("Invalid coupon code")
    ]
}

const updateCouponValidator = () => {
    return [
        body("name").trim().notEmpty().withMessage("Coupon name is required"),
        body("couponCode")
        .trim()
        .notEmpty()
        .withMessage("Coupon code is required")
        .isLength({ min: 4 })
        .withMessage("coupon code must be alt least 4 characters long"),
        body("type")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Coupon code is required")
        .isIn(AvailableCouponTypes)
        .withMessage("Inavlid coupon type"),
        body("discountValue")
        .trim()
        .notEmpty()
        .withMessage("Discount value is required")
        .isInt({
            min: 1,
        })
        .withMessage("Discount value must be greater than 0"),
        body("minimumCartValue")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Invalid minimum cart value")
        .isInt({
            min: 0,
        })
        .withMessage("Minimum cart value can not be negative"),
        body("startDate")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Start date is required")
        .isISO8601()
        .withMessage("Invalid start date. Date must be in ISO8601 format"),
        body("expiryDate")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Expiry date is required")
        .isISO8601()
        .withMessage("Invalid expiry date. Date must be in ISO8601 format"),
    ]
}

const couponActivityStatusValidator = () => {
    return [
        body("isActive")
        .notEmpty()
        .withMessage("Activity status is required")
        .isBoolean({
            strict: true
        })
        .withMessage("isActivity must be an boolean. Either true or false")
    ]
}

export {
    applyCouponCodeValidator,
    createCouponValidator,
    updateCouponValidator,
    couponActivityStatusValidator
}