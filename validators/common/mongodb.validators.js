import { body, param } from "express-validator";


export const mongoIdPathVariableValidator = (idName) => {
    return [
        param(idName).notEmpty().isMongoId().withMessage(`Invalid ${idName}`),
    ]
}