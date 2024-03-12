import { body } from "express-validator"


const bestForRequestBodyValidator = () => {
    return [
        body("name").trim().notEmpty().withMessage("Best For name is required")
    ];
};

export { bestForRequestBodyValidator }