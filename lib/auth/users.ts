import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { hashPassword } from "@/lib/auth/crypto";
import { CandidateUser, CandidateUserRecord } from "@/lib/auth/types";

const usersFile = path.join(process.cwd(), "data", "private", "candidates.json");

async function ensureUsersFile() {
  await mkdir(path.dirname(usersFile), { recursive: true });

  try {
    await readFile(usersFile, "utf8");
  } catch {
    await writeFile(usersFile, "[]\n", "utf8");
  }
}

async function saveUsers(users: CandidateUserRecord[]) {
  const tempFile = `${usersFile}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(users, null, 2)}\n`, "utf8");
  await rename(tempFile, usersFile);
}

export async function listCandidateUsers() {
  await ensureUsersFile();
  const raw = await readFile(usersFile, "utf8");
  return JSON.parse(raw) as CandidateUserRecord[];
}

export async function findCandidateByEmail(email: string) {
  const users = await listCandidateUsers();
  return users.find((user) => user.email === email) ?? null;
}

export async function findCandidateById(id: string) {
  const users = await listCandidateUsers();
  return users.find((user) => user.id === id) ?? null;
}

export async function createCandidateUser(input: {
  fullName: string;
  email: string;
  password: string;
}) {
  const users = await listCandidateUsers();
  const existing = users.find((user) => user.email === input.email);

  if (existing) {
    return null;
  }

  const { hash, salt } = hashPassword(input.password);

  const newUser: CandidateUserRecord = {
    id: randomUUID(),
    fullName: input.fullName.trim(),
    email: input.email,
    role: "candidate",
    createdAt: new Date().toISOString(),
    passwordHash: hash,
    passwordSalt: salt,
  };

  users.push(newUser);
  await saveUsers(users);

  return sanitizeCandidateUser(newUser);
}

export function sanitizeCandidateUser(user: CandidateUserRecord): CandidateUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
