import bcrypt from "bcrypt";
import { IPreviousPasswords } from "../modules/user/user.interface";
import config from "../config/config";

export const hashPassword = (password: string): Promise<string> =>
  bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

export const compareHashPassword = (
  plainPass: string,
  hashPass: string
): Promise<boolean> => bcrypt.compare(plainPass, hashPass);

export const isPasswordUsedBefore = async (
  newPass: string,
  previousPass: IPreviousPasswords[]
): Promise<boolean> => {
  for (const passObj of previousPass) {
    if (await compareHashPassword(newPass, passObj.password)) {
      return true;
    }
  }
  return false;
};

export const getOldestPreviousPassword = (
  previousPass: IPreviousPasswords[]
): IPreviousPasswords | null => {
  if (!previousPass.length) return null;
  return [...previousPass].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )[0];
};
