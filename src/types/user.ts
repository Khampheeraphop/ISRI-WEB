export type Role = "reporter" | "technician" | "admin";

export interface User {
  id: string;
  name: string;
  role: Role;
}
