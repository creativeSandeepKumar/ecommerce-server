import { body } from "express-validator"

const colorRequestBodyValidator = () => {
    return [
        body("name").trim().notEmpty().withMessage("Color name is required")
    ];
};

export { colorRequestBodyValidator }