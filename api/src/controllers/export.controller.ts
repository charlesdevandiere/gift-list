import { RequestHandler, Router } from 'express'
import Papa from 'papaparse'
import passport from 'passport'
import { AuthenticatedUsed } from '../auth'
import { db } from '../db'
import { logger } from '../logger'
import { CsvGift } from '../models/csv-gift.model'

export const exportController = Router()

exportController.get(
  '/export',
  passport.authenticate('user', { session: false }) as RequestHandler,
  async (req, res) => {
    const group: string = (req.user as AuthenticatedUsed).group

    const csv: string = await exportGroup(group)
    const date: string = (new Date()).toISOString().split('T')[0]
    const filename = `giftlist_${group}_${date}.csv`;

    logger.info(`group '${group}' exported`)

    res.header('Content-Type', 'text/csv');
    res.attachment(filename);
    res.send(csv);
  })

async function exportGroup(group: string): Promise<string> {
  const data = await db.usersOnGroups.findMany({
    where: { groupName: group },
    orderBy: { order: 'asc' },
    select: {
      user: {
        include: {
          gifts: {
            orderBy: { order: 'asc' },
            select: {
              name: true,
              link1: true,
              link2: true,
              link3: true
            }
          }
        }
      }
    }
  })
  const users = data.map(element => element.user)

  const gifts: CsvGift[] = [];

  for (const user of users) {
    gifts.push(...user.gifts.map(
      (gift): CsvGift => ({
        user: user.name,
        gift: gift.name,
        link1: gift.link1 ?? '',
        link2: gift.link2 ?? '',
        link3: gift.link3 ?? ''
      })
    ));
  }

  return Papa.unparse(gifts, { delimiter: ';' });
}
