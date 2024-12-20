import { Gift } from '@prisma/client'
import { RequestHandler, Router } from 'express'
import passport from 'passport'
import { AuthenticatedUsed } from '../auth'
import { db } from '../db'
import { logger } from '../logger'

export const giftController = Router()

// list
giftController.get(
  '/users/:userId/gifts',
  passport.authenticate('user', { session: false }) as RequestHandler,
  async (req, res) => {
    const userId: string | undefined = (req.user as AuthenticatedUsed).id

    const gifts: Gift[] = await db.gift.findMany({
      where: { userId: req.params.userId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        link1: true,
        link2: true,
        link3: true,
        userId: true,
        offeredByUserId: !!userId && userId !== req.params.userId,
        order: true
      }
    })

    res.send(gifts)
  })

// order
giftController.patch(
  '/users/:userId/gifts',
  passport.authenticate('user', { session: false }) as RequestHandler,
  async (req, res) => {
    const userId: string | undefined = (req.user as AuthenticatedUsed).id
    const data: { giftId: string, order: number }[] = req.body

    if (userId !== req.params.userId) {
      res.status(403).send()
      return
    }

    for (const element of data) {
      await db.gift.update({
        data: {
          order: element.order
        },
        where: {
          id: element.giftId,
          userId: req.params.userId
        }
      })
    }
    logger.info(`Gifts order for user '${userId}' updated`)

    res.status(204).send()
  }
)

// get
giftController.get(
  '/users/:userId/gifts/:id',
  passport.authenticate('user', { session: false }) as RequestHandler,
  async (req, res) => {
    const gift: Gift | null = await db.gift.findFirst({
      where: { id: req.params.id }
    })

    if (gift) {
      res.send(gift)
    }
    else {
      res.status(404).send({ error: 'gift not found' })
    }
  })

// create
giftController.post(
  '/users/:userId/gifts',
  passport.authenticate('user', { session: false }) as RequestHandler,
  async (req, res) => {
    const userId: string | undefined = (req.user as AuthenticatedUsed).id
    const name: string | null = req.body.name

    if (userId !== req.params.userId) {
      res.status(403).send()
      return
    }

    if (!name || name.length < 2 || name.length > 250) {
      res.status(400).send({ error: 'gift name is required and must be between 2 and 250 characters' })
      return
    }

    if (process.env.MAX_NUMBER_OF_GIFTS_PER_USER) {
      const count: number = await db.gift.count({ where: { userId: req.params.userId } })
      if (count >= +process.env.MAX_NUMBER_OF_GIFTS_PER_USER) {
        res.status(400).send({ error: 'the maximum number of gifts for this user has already been reached' })
        return
      }
    }

    const order: number = (await db.gift.findFirst({
      where: { userId: req.params.userId },
      orderBy: { order: 'desc' },
      select: { order: true }
    }))?.order ?? 0

    const gift: Gift = await db.gift.create({
      data: {
        name: name,
        link1: req.body.link1,
        link2: req.body.link2,
        link3: req.body.link3,
        order: order + 1,
        userId: req.params.userId
      }
    })
    logger.info(`Gift '${name}' created and added to user ${req.params.userId}`)

    res.location(req.protocol + '://' + req.get('host') + `/users/${req.params.userId}/gifts/${gift.id}`).status(201).send(gift)
  })

// update
giftController.put(
  '/users/:userId/gifts/:giftId',
  passport.authenticate('user', { session: false }) as RequestHandler,
  async (req, res) => {
    const userId: string | undefined = (req.user as AuthenticatedUsed).id
    const name: string | null = req.body.name

    if (userId !== req.params.userId) {
      res.status(403).send()
      return
    }

    if (!name || name.length < 2 || name.length > 250) {
      res.status(400).send({ error: 'user name is required and must be between 2 and 250 characters' })
      return
    }

    if (!await db.gift.count({ where: { id: req.params.giftId, userId: req.params.userId } })) {
      res.status(404).send({ error: 'Gift not found' })
      return
    }

    const gift: Gift = await db.gift.update({
      data: {
        name: name,
        link1: req.body.link1,
        link2: req.body.link2,
        link3: req.body.link3
      },
      where: {
        id: req.params.giftId
      }
    })
    logger.info(`Gift ${gift.id} updated`)

    res.status(204).send()
  })

// delete
giftController.delete(
  '/users/:userId/gifts/:giftId',
  passport.authenticate('user', { session: false }) as RequestHandler,
  async (req, res) => {
    const userId: string | undefined = (req.user as AuthenticatedUsed).id
    if (userId !== req.params.userId) {
      res.status(403).send()
      return
    }

    if ((await db.gift.count({ where: { id: req.params.giftId, userId: req.params.userId } })) == 0) {
      res.status(404).send()
      return
    }

    await db.gift.delete({
      where: { id: req.params.giftId }
    })

    logger.info(`Gift ${req.params.giftId} deleted`)

    res.status(204).send()
  })

// offer
giftController.post(
  '/users/:userId/gifts/:giftId/offer',
  passport.authenticate('user', { session: false }) as RequestHandler,
  async (req, res) => {
    const userId: string | undefined = (req.user as AuthenticatedUsed).id

    if (!userId) {
      res.status(403).send({ error: 'anonimous user cannot offer gift' })
      return
    }
    else if (userId === req.params.userId) {
      res.status(403).send({ error: 'user cannot offer gift to himseft' })
      return
    }

    if ((await db.gift.count({ where: { id: req.params.giftId, userId: req.params.userId } })) == 0) {
      res.status(404).send({ error: 'gift not found' })
      return
    }

    await db.gift.update({
      data: {
        offeredByUserId: userId
      },
      where: { id: req.params.giftId }
    })

    logger.info(`Gift ${req.params.giftId} offered`)

    res.status(204).send()
  })

// unoffer
giftController.post(
  '/users/:userId/gifts/:giftId/unoffer',
  passport.authenticate('user', { session: false }) as RequestHandler,
  async (req, res) => {
    const userId: string | undefined = (req.user as AuthenticatedUsed).id

    if (!userId) {
      res.status(403).send({ error: 'anonimous user cannot unoffer gift' })
      return
    }
    else if (userId === req.params.userId) {
      res.status(403).send({ error: 'user cannot unoffer gift to himseft' })
      return
    }

    const gift: Gift | null = await db.gift.findFirst({ where: { id: req.params.giftId, userId: req.params.userId } })

    if (!gift) {
      res.status(404).send({ error: 'gift not found' })
      return
    }
    else if (gift.offeredByUserId !== userId) {
      res.status(403).send({ error: 'user cannot unoffer a gift that he did not offer' })
      return
    }

    await db.gift.update({
      data: {
        offeredByUserId: null
      },
      where: { id: req.params.giftId }
    })

    logger.info(`Gift ${req.params.giftId} unoffered`)

    res.status(204).send()
  })
