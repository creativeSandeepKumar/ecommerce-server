import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT =  asyncHandler(async(req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "");

    if(!token) {
        throw new ApiError(401, "Unauthorize request");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificarionToken -emailVerificarionTokenExpiry");

        if(!user) {
            throw new ApiError(401, "Inavlid access token");
        }

        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401, error?.message || "Inavlid access token");
    }

} );

export const verifyPermission = (roles = []) => 
    asyncHandler(async(req, res, next) => {
        if(!req.user?._id) {
            throw new ApiError(401, "Unautorized request");
        }
        if(roles.includes(req.user?.role)) {
            next();
        } else {
            throw new ApiError(403, "You are not allowed to perform this action");
        }
    });

export const MAXIMUM_SUB_IMAGE_COUNT = 5;
