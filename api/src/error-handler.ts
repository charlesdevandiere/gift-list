/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const errorHandler = (err: Error, _req: any, res: any): void => {
  console.error(err.stack)
  res.status(500).send({ error: 'Internal server error.' })
}
