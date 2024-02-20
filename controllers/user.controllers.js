import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserLoginType, UserRolesEnum } from "../constants.js";
import { emailVerificationMailGenContent, forgotPasswordMailGenContent, sendEmail } from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getLocalPath, getStaticFilePath, removeLocalFile } from "../utils/helpers.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating the access token');
    }
}

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email already exists", []);
  }

  const user = await User.create({
    email,
    password,
    isEmailVerified: false,
    username,
    role: role || UserRolesEnum.USER,
  });

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailGenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/verify-email/${unHashedToken}`
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User registered successfully and verification email has been sent in your email"
      )
    );
});

const logInUser = asyncHandler(async(req, res) => {
    const { email, username, password } = req.body;

    if(!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, {email}],
    });

    if(!user) {
        throw new ApiError(404, "User does not exist");
    }

    if(user.loginType !== UserLoginType.EMAIL_PASSWORD) {
        throw new ApiError(400, "You have previously registered using " + user.loginType?.toLowerCase() + " login option to aceess your account.")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, {user: loggedInUser }, "User logged in successfully"))

});

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    console.log("check refresh token", incomingRefreshToken)

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unautorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
        if(!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }


        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV == "PRODUCTION",
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res.status(200).cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, {
            accessToken, refreshToken: newRefreshToken
        }, "Access token refreshed"))
        
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const forgotPasswordRequest = asyncHandler(async(req, res) => {
    const {email} = req.body;

    const user = await User.findOne({email});

    if(!user) {
        throw new ApiError(401, "Unautorized request", []);
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordTokenExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false});

    await sendEmail({
        email: user?.email,
        subject: "Password reset request",
        mailgenContent: forgotPasswordMailGenContent(
          user.username,
          `${req.protocol}://${req.get(
            "host"
          )}/api/v1/users/reset-password/${unHashedToken}`
        ),
      });

        return res.status(200)
        .json(new ApiError(200, {}, "Password reset mail has been sent on your mail id"))
        
});

const resetForgottenPassword = asyncHandler(async(req, res) => {
    const { resetToken } = req.params;
    const {newPassword} = req.body;

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: {$gt: Date.now()},});

    if(!user) {
        throw new ApiError(489, "Token in invalid or expired");
    }

    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;

    user.password = newPassword;

    await user.save({validateBeforeSave: false});

        return res.status(200)
        .json(new ApiResponse(200, {}, "Password reset successfully"))
        
});


const verifyEmail = asyncHandler(async(req, res) => {
    const { verificationToken } = req.params;

    if(!verificationToken) {
        throw new ApiError(401, "Email verification token is missing");
    }
    
    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationTokenExpiry: { $gt: Date.now()},
        });

        if(!user) {
            throw new ApiError(401, "Token is invalid or expired");
        }

        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpiry = undefined;

        user.isEmailVerified = true;

        await user.save({ validateBeforeSave: false });

        return res.status(200).json(new ApiResponse(200, {isEmailVerified: true}, "Email is verified"));
        
 
})

const logoutUser = asyncHandler(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined,
        },
    },
    { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "PRODUCTION",
    };

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out"));
});

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordValid) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  
    const user = await User.findById(req.user?._id);
  
    if (!user) {
      throw new ApiError(409, "User does not exists", []);
    }

    if(user.isEmailVerified) {
        throw new ApiError(409, "Email is already verified");
    }
  
    const { unHashedToken, hashedToken, tokenExpiry } =
      user.generateTemporaryToken();
  
    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });
  
    await sendEmail({
      email: user?.email,
      subject: "Please verify your email",
      mailgenContent: emailVerificationMailGenContent(
        user.username,
        `${req.protocol}://${req.get(
          "host"
        )}/api/v1/users/verify-email/${unHashedToken}`
      ),
    });
  
    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          { },
          "Mail has been sent to your mail Id"
        )
      );
  });
  

const updateUserAvatar = asyncHandler(async(req, res, next) => {
    if(!req.file?.filename) {
        throw new ApiError(400, "Avatar image is required");
    }

    console.log("can we get avatar")

    const avatarUrl = getStaticFilePath(req, req.file?.filename);

    const avatarLocalPath = getLocalPath(req.file?.filename);

    const user = await User.findById(req.user._id);

    let updatedUser = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            avatar: {
                url: avatarUrl,
                localPath: avatarLocalPath,
            }
        }
    },
    {
        new: true
    }).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry");

removeLocalFile(user.avatar.localPath);

return res.status(200).json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
    
});

const assignRole = asyncHandler(async(req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  const user = await User.findById(userId);

  if(!user) {
    throw new ApiError(404, "User does not exist");
  }

  user.role = role;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiError(200, {}, "Role changed for the user"));

})
const handleSocialLogin = asyncHandler(async(req, res) => {
  const user = await User.findById(req.user?._id);

  if(!user) {
    throw new ApiError(404, "User does not exist");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user?._id);

  const options = {
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
  }

  return res.status(301).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).redirect(`${process.env.CLIENT_SSO_REDIRECT_URL}?accessToken=${accessToken}&refreshToken=${refreshToken}`)
});





export { registerUser, logInUser, logoutUser, refreshAccessToken, verifyEmail, forgotPasswordRequest, resetForgottenPassword, updateUserAvatar, getCurrentUser, changeCurrentPassword, resendEmailVerification, assignRole, handleSocialLogin };
