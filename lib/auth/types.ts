export type CandidateUser = {
  id: string;
  fullName: string;
  email: string;
  role: "candidate";
  createdAt: string;
};

// Null for accounts created through social sign-in, which have no password.
export type CandidateUserRecord = CandidateUser & {
  passwordSalt: string | null;
  passwordHash: string | null;
};
