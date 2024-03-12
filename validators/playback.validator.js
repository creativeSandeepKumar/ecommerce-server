import { body } from "express-validator"


const playbackRequestBodyValidator = () => {
    return [
        body("name").trim().notEmpty().withMessage("Playback name is required")
    ];
};

export { playbackRequestBodyValidator }