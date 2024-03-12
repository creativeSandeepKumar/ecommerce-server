import { body } from "express-validator"

const featuresRequestBodyValidator = () => {
    return [
        body("name").trim().notEmpty().withMessage("Features shape name is required")
    ];
};

export { featuresRequestBodyValidator }