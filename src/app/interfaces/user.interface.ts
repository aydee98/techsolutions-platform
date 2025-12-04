export interface User {
  id: number;
  username: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Accountant' | 'Purchasing' | 'User';
  permissions: string[];
  createdAt?: Date;
  updatedAt?: Date;
}