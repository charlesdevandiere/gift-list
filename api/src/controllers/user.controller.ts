import { RequestHandler, Router } from 'express'
import passport from 'passport'
import { db } from '../db'
import { AuthenticatedUsed } from '../auth'
import { logger } from '../logger'
import { User } from '@prisma/client'

export const userController = Router()

// list
userController.get(
  '/users',
  passport.authenticate('user', { session: false }) as RequestHandler,
  async (req, res) => {
    const group: string = (req.user as AuthenticatedUsed).group
    const data = await db.usersOnGroups.findMany({
      where: { groupName: group },
      orderBy: { order: 'asc' },
      select: {
        user: true,
        order: true
      }
    })
    res.send(data.map(element => ({ order: element.order, ...element.user })))
  })

// order
userController.patch(
  '/users',
  passport.authenticate('user', { session: false }) as RequestHandler,
  async (req, res) => {
    const group: string = (req.user as AuthenticatedUsed).group
    const data: { userId: string, order: number }[] = req.body

    for (const element of data) {
      if (!await db.usersOnGroups.count({ where: { userId: element.userId, groupName: group } })) {
        res.status(404).send({ error: 'User not found' })
        return
      }

      await db.usersOnGroups.update({
        data: {
          order: element.order
        },
        where: {
          userId_groupName: {
            userId: element.userId,
            groupName: group,
          }
        }
      })
    }
    logger.info(`Order for group '${group}' updated`)

    res.status(204).send()
  }
)

// get
userController.get(
  '/users/:id',
  passport.authenticate('user', { session: false }) as RequestHandler,
  async (req, res) => {
    const user: User | null = await db.user.findFirst({
      where: { id: req.params.id }
    })

    if (user) {
      res.send(user)
    }
    else {
      res.status(404).send({ error: 'user not found' })
    }
  })

// create
userController.post(
  '/users',
  passport.authenticate('user', { session: false }) as RequestHandler,
  async (req, res) => {
    const group: string = (req.user as AuthenticatedUsed).group
    const name: string | null = req.body.name
    const picture: string | null = req.body.picture

    if (!name || name.length < 2 || name.length > 250) {
      res.status(400).send({ error: 'user name is required and must be between 2 and 250 characters' })
      return
    }

    if (picture && (picture.length < 2 || picture.length > 250)) {
      res.status(400).send({ error: 'user picture must be between 2 and 250 characters' })
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

    const groupName: string = (req.user as AuthenticatedUsed).group
    const user: User = await db.user.create({
      data: {
        name: name,
        picture: picture,
        groups: {
          create: {
            order: order + 1,
            groupName: groupName
          }
        }
      }
    })
    logger.info(`User '${name}' created and added to group ${groupName}`)

    res.location(req.protocol + '://' + req.get('host') + '/users/' + user.id).status(201).send(user)
  })

// update
userController.put(
  '/users/:id',
  passport.authenticate('user', { session: false }) as RequestHandler,
  async (req, res) => {
    const name: string | null = req.body.name
    const picture: string | null = req.body.picture

    if (!name || name.length < 2 || name.length > 250) {
      res.status(400).send({ error: 'user name is required and must be between 2 and 250 characters' })
      return
    }

    if (picture && (picture.length < 2 || picture.length > 250)) {
      res.status(400).send({ error: 'user picture must be between 2 and 250 characters' })
      return
    }

    const groupName: string = (req.user as AuthenticatedUsed).group

    if (!await db.user.count({ where: { id: req.params.id, groups: { some: { groupName: groupName } } } })) {
      res.status(404).send({ error: 'User not found' })
      return
    }

    const user: User = await db.user.update({
      data: {
        name: name,
        picture: picture
      },
      where: {
        id: req.params.id
      }
    })
    logger.info(`User '${user.name}' updated`)

    res.status(204).send()
  })

// delete
userController.delete(
  '/users/:id',
  passport.authenticate('user', { session: false }) as RequestHandler,
  async (req, res) => {
    if ((await db.user.count({ where: { id: req.params.id } })) == 0) {
      res.status(404).send()
      return
    }

    await db.user.delete({
      where: { id: req.params.id }
    })

    logger.info(`User '${req.params.id}' deleted`)

    res.status(204).send()
  })
