import { RequestHandler, Router } from 'express'
import passport from 'passport'
import { AuthenticatedUsed } from '../auth'
import { db } from '../db'
import { User } from '../generated/client'

export const meController = Router()

// me
meController.get(
  '/me',
  passport.authenticate('user', { session: false }) as RequestHandler,
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
  passport.authenticate('user', { session: false }) as RequestHandler,
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
