import { body } from "express-validator"

const activeofferRequestBodyValidator = () => {
    return [
        body("name").trim().notEmpty().withMessage("Active Offers name is required")
    ];
};

export { activeofferRequestBodyValidator }