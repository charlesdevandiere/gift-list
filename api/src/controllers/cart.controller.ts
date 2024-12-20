import { RequestHandler, Router } from 'express'
import passport from 'passport'
import { AuthenticatedUsed } from '../auth'
import { db } from '../db'

export const cartController = Router()

// cart
cartController.get(
  '/users/:userId/cart',
  passport.authenticate('user', { session: false }) as RequestHandler,
  async (req, res) => {
    const group: string = (req.user as AuthenticatedUsed).group
    const userId: string | undefined = (req.user as AuthenticatedUsed).id

    if (!userId || userId !== req.params.userId) {
      res.status(403).send()
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
