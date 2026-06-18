import { Router } from 'express'
import { authenticate, AuthenticatedUsed } from '../auth'
import { db } from '../db'
import { User } from '../generated/client'
import { logger } from '../logger'

export const meController = Router()

// me
meController.get(
  '/me',
  authenticate('user'),
  async (req, res) => {
    const group: string = (req.user as AuthenticatedUsed).group
    const userId: string | undefined = (req.user as AuthenticatedUsed).id

    const me: { group: string, name?: string, id?: string, picture?: string | null } = {
      group: group
    }

    if (userId) {
      const user: User | null = await db.user.findUnique({
        where: { id: userId, groups: { some: { groupName: group } } }
      })

      if (user) {
        me.id = user.id
        me.name = user.name
        me.picture = user.picture
      }
      else {
        res.status(403).send({ error: 'user not found in the group' })
      }
    }

    res.status(200).send(me)
  })

// cart
meController.get(
  '/me/cart',
  authenticate('user'),
  async (req, res) => {
    const group: string = (req.user as AuthenticatedUsed).group
    const userId: string | undefined = (req.user as AuthenticatedUsed).id

    if (!userId) {
      res.status(404).send({ error: 'cart not available for anonymous user' })
      return
    }

    const cart = await db.usersOnGroups.findMany({
      where: { groupName: group },
      include: {
        user: {
          include: {
            gifts: {
              where: { offeredByUserId: userId },
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    })

    res.send(cart.map(item => ({ ...item.user, order: item.order, gifts: item.user.gifts })).filter(item => item.gifts.length))
  })

// join group
meController.post(
  '/me/join',
  authenticate('user'),
  async (req, res) => {
    const group: string = (req.user as AuthenticatedUsed).group
    const userId: string | undefined = (req.user as AuthenticatedUsed).id

    if (!userId) {
      res.status(403).send()
      return
    }

    if ((await db.user.count({ where: { id: userId } })) == 0) {
      res.status(404).send()
      return
    }

    if (await db.usersOnGroups.count({ where: { userId: userId, groupName: group } })) {
      // user already in group
      res.status(204).send()
      return
    }

    if (process.env.MAX_NUMBER_OF_USERS_PER_GROUP) {
      const count: number = await db.user.count({ where: { groups: { some: { groupName: group } } } })
      if (count >= +process.env.MAX_NUMBER_OF_USERS_PER_GROUP) {
        res.status(400).send({ error: 'the maximum number of users for this group has already been reached' })
        return
      }
    }

    const order: number = (await db.usersOnGroups.findFirst({
      where: { groupName: group },
      orderBy: { order: 'desc' },
      select: { order: true }
    }))?.order ?? 0

    await db.usersOnGroups.create({
      data: {
        order: order,
        groupName: group,
        userId: userId
      }
    })

    logger.info(`User '${userId}' added to group ${group}`)

    res.status(204).send()
  })
