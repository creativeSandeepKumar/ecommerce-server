import { body } from "express-validator"

const colorRequestBodyValidator = () => {
    return [
        body("name").trim().notEmpty().withMessage("Color name is required"),
        body("colorCode").trim().notEmpty().withMessage("Color Code is required"),
    ];
};

export { colorRequestBodyValidator }