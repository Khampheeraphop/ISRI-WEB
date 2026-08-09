export type Role = "reporter" | "technician" | "dispatcher" | "admin";

export interface User {
  id: string;
  name: string;
  role: Role;
}
