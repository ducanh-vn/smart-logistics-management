"use client";
import type { NewUserInput, UserPatch, UserRow } from "@/types/admin";
import { useFetch } from "./useFetch";
import { useMutation } from "./useMutation";

/** FR32 – accounts: list, create, change role, lock/unlock, reset password. */
export function useUsers() {
  const { data, loading, reload } = useFetch<UserRow[]>("/api/admin/users");
  const create = useMutation<NewUserInput>("/api/admin/users");
  const patch = useMutation<UserPatch>("", "PATCH");
  const update = async (id: number, p: UserPatch) => { const ok = await patch.run(p, `/api/admin/users/${id}`); if (ok) reload(); return !!ok; };
  const add = async (input: NewUserInput) => { const ok = await create.run(input); if (ok) reload(); return !!ok; };
  return { users: data ?? [], loading, update, add, creating: create.loading, error: patch.error, createError: create.error, setCreateError: create.setError };
}
