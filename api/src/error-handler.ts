/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { logger } from './logger'

export const errorHandler = (err: Error, _req: any, res: any, _next: unknown): void => {
  logger.error(err.stack)
  res.status(500).send({ error: 'Internal server error.' })
}
