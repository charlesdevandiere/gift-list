import { Router } from 'express'
import 'express-async-errors'
import passport from 'passport'
import { AuthenticatedUsed } from '../auth'
import { db } from '../db'

export const cartController = Router()

// cart
cartController.get(
  '/users/:userId/cart',
  passport.authenticate('user', { session: false }),
  async (req, res) => {
    const group: string | undefined = (req.user as AuthenticatedUsed).group
    const userId: string | undefined = (req.user as AuthenticatedUsed).id

    if (!userId) {
      return res.status(403).send()
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

    return res.send(cart.map(item => ({ ...item.user, order: item.order, gifts: item.user.gifts })).filter(item => item.gifts.length))
  })
