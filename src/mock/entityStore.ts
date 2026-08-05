import type { User } from "../types/user";

export type EntityName = "users";
type EntityMap = { users: User };
type NewEntityMap = { users: Omit<User, "id"> };

const records: { [K in EntityName]: EntityMap[K][] } = {
  users: [
    { id: "USR-001", name: "คุณศิริพร วัฒนากร", role: "reporter" },
    { id: "USR-002", name: "นายธนกร ช่างทอง", role: "technician" },
    { id: "USR-003", name: "นางสาวกมลวรรณ ศรีสุข", role: "admin" },
  ],
};

const clone = <T>(value: T): T => structuredClone(value);
const pause = () => new Promise((resolve) => setTimeout(resolve, 120));
const entityPrefixes: Record<EntityName, string> = { users: "USR" };

export const entityStore = {
  async list<K extends EntityName>(entity: K): Promise<EntityMap[K][]> {
    await pause();
    return clone(records[entity]);
  },
  async create<K extends EntityName>(
    entity: K,
    values: NewEntityMap[K],
  ): Promise<EntityMap[K]> {
    await pause();
    const id = `${entityPrefixes[entity]}-${String(records[entity].length + 1).padStart(3, "0")}`;
    const record = { ...values, id } as EntityMap[K];
    records[entity].push(record);
    return clone(record);
  },
};
