export type CandidateUser = {
  id: string;
  fullName: string;
  email: string;
  role: "candidate";
  createdAt: string;
};

export type CandidateUserRecord = CandidateUser & {
  passwordSalt: string;
  passwordHash: string;
};
