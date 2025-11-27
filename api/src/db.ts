import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const url = new URL(process.env.DATABASE_URL ?? '');
const params = new URLSearchParams(url.search);
const schema = params.get('schema');
const adapter = new PrismaPg( // https://github.com/prisma/prisma/issues/28611
  {
    connectionString: process.env.DATABASE_URL,
    options: schema ? `-c search_path=${schema}` : undefined, // this one will make raw queries work
  },
  { schema: schema ?? undefined } // this one will make the table methods from prisma work
)
export const db = new PrismaClient({ adapter })
