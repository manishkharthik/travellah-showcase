import { Poll } from "@prisma/client";

export type ExtendedPoll = Poll & {
  creator: {
    id: number;
    name: string;
    username: string;
  };
  options: {
    id: string;
    text: string;
    votes: { id: string; userId: number }[];
  }[];
  votes: {
    id: string;
    userId: number;
  }[];
};