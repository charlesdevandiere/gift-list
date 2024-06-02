import { Router } from "express";
import passport from "passport";
import { db } from "../db";
import { AuthenticatedUsed } from "../auth";
import { logger } from "../logger";
import { User } from "@prisma/client";

export const userController = Router()

// list
userController.get(
  '/',
  passport.authenticate('user', { session: false }),
  async (req, res) => {
    const group: string = (req.user as AuthenticatedUsed).group
    const users = await db.user.findMany({
      where: { groups: { some: { groupName: group } } }
    })
    res.send(users)
  })

// get
userController.get(
  '/:id',
  passport.authenticate('user', { session: false }),
  async (req, res) => {
    const user = await db.user.findFirst({
      where: { id: req.params.id }
    })

    if (user) {
      res.send(user)
    }
    else {
      res.status(404).send({ error: 'user not found'})
    }
  })

// create
userController.post(
  '/',
  passport.authenticate('user', { session: false }),
  async (req, res) => {
    const name: string | null = req.body.name
    const picture: string | null = req.body.picture

    if (!name || name.length < 2 || name.length > 250) {
      res.status(400).send({ error: 'user name must be between 2 and 250 characters' })
      return
    }

    if (picture && (picture.length < 2 || picture.length > 250)) {
      res.status(400).send({ error: 'user picture must be between 2 and 250 characters' })
      return
    }

    const groupName: string = (req.user as AuthenticatedUsed).group
    const user: User = await db.user.create({
      data: {
        name: name,
        picture: picture,
        groups: {
          create: {
            order: 1,
            groupName: groupName
          }
        }
      }
    })
    logger.info(`User '${name}' created and added to group ${groupName}`)

    res.location(req.protocol + '://' + req.get('host') + '/users/' + user.id).status(201).send(user)
  })
