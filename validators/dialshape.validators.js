import { body } from "express-validator"


const dialshapeRequestBodyValidator = () => {
    return [
        body("name").trim().notEmpty().withMessage("Dial shape name is required")
    ];
};

export { dialshapeRequestBodyValidator }