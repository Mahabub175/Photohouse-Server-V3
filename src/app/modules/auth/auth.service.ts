import mongoose from "mongoose";
import config from "../../config/config";
import {
  compareHashPassword,
  getOldestPreviousPassword,
  hashPassword,
  isPasswordUsedBefore,
} from "../../utils/passwordUtils";
import { throwError } from "../../utils/response";
import { userModel } from "../user/user.model";
import jwt from "jsonwebtoken";

const loginUserService = async (userData: { id: string; password: string }) => {
  const { id, password } = userData;

  const query = id.includes("@") ? { email: id } : { username: id };

  const user = await userModel
    .findOne(query)
    .select("_id username email password role status")
    .lean();

  if (!user) {
    return throwError("User not found!", 404);
  }

  if (!user.status) {
    return throwError("Your account is inactive. Please contact support.", 403);
  }

  const isPasswordValid = await compareHashPassword(password, user.password);
  if (!isPasswordValid) {
    return throwError(
      "Wrong password! Please try again with a valid password!",
      401
    );
  }

  const expirationTime = Math.floor(Date.now() / 1000) + 2 * 24 * 60 * 60;
  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    exp: expirationTime,
  };

  const token = jwt.sign(jwtPayload, config.jwt_access_secret as string);

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    token,
  };
};

export const changeUserPasswordService = async (
  userId: string,
  userData: { currentPassword: string; newPassword: string }
) => {
  const user = await userModel
    .findById(userId)
    .select("password previousPasswords")
    .lean();

  if (!user) {
    return throwError("User not found!", 404);
  }

  const matchPassword = await compareHashPassword(
    userData.currentPassword,
    user.password
  );

  if (!matchPassword) {
    return throwError("Passwords do not match! Please try again!", 400);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { previousPasswords } = user;

    const sameAsCurrent = await compareHashPassword(
      userData.newPassword,
      user.password
    );
    if (sameAsCurrent) {
      return throwError(
        "Password change failed! Please use a new password not matching the last 2 used ones.",
        400
      );
    }

    const hashedPassword = await hashPassword(userData.newPassword);

    if (previousPasswords && previousPasswords.length > 0) {
      const isReused = await isPasswordUsedBefore(
        userData.newPassword,
        previousPasswords
      );
      if (isReused) {
        return throwError(
          "Password change failed! Please use a new password not matching the last 2 used ones.",
          400
        );
      }

      if (previousPasswords.length >= 2) {
        const lastPrevious = getOldestPreviousPassword(previousPasswords);
        if (lastPrevious) {
          await userModel.findByIdAndUpdate(
            userId,
            {
              $pull: { previousPasswords: { password: lastPrevious.password } },
            },
            { session, runValidators: true }
          );
        }
      }
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        $addToSet: {
          previousPasswords: {
            password: hashedPassword,
            createdAt: new Date(),
          },
        },
      },
      { session, runValidators: true, new: true }
    );

    if (!updatedUser) {
      return throwError("Failed to change password!", 500);
    }

    await session.commitTransaction();
    await session.endSession();

    return updatedUser;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    return throwError(error.message || "Password change failed!", 500);
  }
};

export const authServices = { loginUserService, changeUserPasswordService };
