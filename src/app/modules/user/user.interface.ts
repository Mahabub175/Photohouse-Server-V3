import { UserRole } from "../../global/global.interface";

export interface IPreviousPasswords {
  password: string;
  createdAt: Date;
}

export interface IUser {
  username: string;
  email: string;
  password: string;
  name: string;
  profile_image: string;
  address: string;
  phone_number: string;
  role: UserRole;
  previousPasswords: IPreviousPasswords[];
  status: boolean;
}
