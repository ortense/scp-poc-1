import { type Fetcher, fetcher } from "../lib/fetcher";
import { failure } from "../lib/result";
import type { User } from "./types";
import type { UserRepository } from "./types";

export function createUserRepository(
  host: string,
  request: Fetcher = fetcher,
): UserRepository {
  return {
    async getAll() {
      const result = await request(`${host}/users`);

      if (!result.ok) return failure(new Error("Unable to fetch users"));

      const user = await result.value.json<User[]>();

      return user;
    },
    async getByID(id) {
      const result = await request(`${host}/users/${id}`);

      if (!result.ok) return failure(new Error("Unable to fetch user by ID"));

      const user = await result.value.json<User>();

      return user;
    },
  };
}
