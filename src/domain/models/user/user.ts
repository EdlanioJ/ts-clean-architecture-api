export interface UserModel {
  id: string;
  tin: string;
  name: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  dataVersion: number;
}
