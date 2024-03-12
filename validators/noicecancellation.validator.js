import { body } from "express-validator"


const noicecancellationRequestBodyValidator = () => {
    return [
        body("name").trim().notEmpty().withMessage("Noice cancellation name is required")
    ];
};

export { noicecancellationRequestBodyValidator }