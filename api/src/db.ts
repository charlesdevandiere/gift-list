import { PrismaClient } from "./generated/client";
import { logger } from "./logger";

export const db = new PrismaClient()

db.$queryRaw`SELECT 1;`
  .catch((err: unknown) => {
    logger.error('Unable to connect to database.', err)
  })
