import { Router } from 'express'
import multer from 'multer'
import Papa from 'papaparse'
import { authenticate, AuthenticatedUsed } from '../auth'
import { db } from '../db'
import { Gift, User } from '../generated/prisma/client'
import { logger } from '../logger'
import { CsvGift } from '../models/csv-gift.model'
import { ImportResult } from '../models/import-result.model'

const upload = multer({ storage: multer.memoryStorage() })

export const importController = Router()

importController.post(
  '/import',
  authenticate('user'),
  upload.single('file'),
  async (req, res) => {
    const group: string = (req.user as AuthenticatedUsed).group

    if (!req.file) {
      res.status(404).send({ error: 'file param is required.' })
      return
    }

    const csv: string = req.file.buffer.toString()
    const result: ImportResult = await importGroup(group, csv)

    logger.info(`group '${group}' imported`)

    res.status(201).send(result)
  })

async function importGroup(group: string, body: string): Promise<ImportResult> {
  const fileContent: string = body.replace('ï»¿', '')
  const csv: Papa.ParseResult<CsvGift> = Papa.parse<CsvGift>(fileContent, { delimiter: '', header: true, skipEmptyLines: true })
  return await importCsvData(group, csv.data)
}

async function importCsvData(group: string, data: CsvGift[]): Promise<ImportResult> {
  logger.info(`import ${data.length} gifts`)
  const result: ImportResult = {}

  try {
    await db.$transaction(async () => {
      const existingUsers: User[] = (
        await db.usersOnGroups.findMany({
          where: { groupName: group },
          select: {
            user: true
          }
        }))
        .map(element => element.user)

      for (let index = 0; index < data.length; index++) {
        const csvGift: CsvGift = data[index]

        // user
        const importedUser = await importUser(group, existingUsers, index, csvGift)
        result.success ??= { importedUsers: {}, importedGifts: {} };
        result.success.importedUsers[csvGift.user] = importedUser.status
        const user: User = importedUser.user

        // gift
        await importGift(user, index, csvGift)
        result.success.importedGifts[csvGift.user] = (result.success.importedGifts[csvGift.user] ?? 0) + 1
      }
    })
  } catch (err) {
    delete result.success
    if (err instanceof Error) {
      result.error = err.message
    }
    else {
      result.error = 'an error occured while trying to import group'
    }
  }

  return result
}

async function importUser(group: string, existingUsers: User[], rowNumber: number, csvGift: CsvGift): Promise<{ user: User, status: 'already exists' | 'imported' }> {
  const existingUser: User | undefined = existingUsers.find(u => u.name == csvGift.user)

  if (existingUser) {
    return { user: existingUser, status: 'already exists' }
  }
  else {
    // create new user
    if (!csvGift.gift || csvGift.gift.length < 2 || csvGift.gift.length > 250) {
      throw new Error(`row ${rowNumber}: user name is required and must be between 2 and 250 characters`)
    }

    if (process.env.MAX_NUMBER_OF_USERS_PER_GROUP) {
      const count: number = await db.user.count({ where: { groups: { some: { groupName: group } } } })
      if (count >= +process.env.MAX_NUMBER_OF_USERS_PER_GROUP) {
        throw new Error(`row ${rowNumber}: the maximum number of users for this group has already been reached`)
      }
    }

    const order: number = (await db.usersOnGroups.findFirst({
      where: { groupName: group },
      orderBy: { order: 'desc' },
      select: { order: true }
    }))?.order ?? 0

    const newUser: User = await db.user.create({
      data: {
        name: csvGift.user,
        picture: '',
        groups: {
          create: {
            order: order + 1,
            groupName: group
          }
        }
      }
    })

    return { user: newUser, status: 'imported' }
  }
}

async function importGift(user: User, rowNumber: number, csvGift: CsvGift): Promise<Gift> {
  if (!csvGift.gift || csvGift.gift.length < 2 || csvGift.gift.length > 250) {
    throw new Error(`row ${rowNumber}: gift name is required and must be between 2 and 250 characters`)
  }

  if (process.env.MAX_NUMBER_OF_GIFTS_PER_USER) {
    const count: number = await db.gift.count({ where: { userId: user.id } })
    if (count >= +process.env.MAX_NUMBER_OF_GIFTS_PER_USER) {
      throw new Error(`row ${rowNumber}: the maximum number of gifts for this user has already been reached`)
    }
  }

  const order: number = (await db.gift.findFirst({
    where: { userId: user.id },
    orderBy: { order: 'desc' },
    select: { order: true }
  }))?.order ?? 0

  const gift: Gift = await db.gift.create({
    data: {
      name: csvGift.gift,
      link1: csvGift.link1,
      link2: csvGift.link2,
      link3: csvGift.link3,
      order: order + 1,
      userId: user.id
    }
  })

  return gift
}
