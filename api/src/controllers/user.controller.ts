import { Router } from "express";
import passport from "passport";
import { db } from "../db";
import { AuthenticatedUsed } from "../auth";
import { logger } from "../logger";
import { User } from "@prisma/client";
import 'express-async-errors'

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
    return res.send(users)
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
      return res.send(user)
    }
    else {
      return res.status(404).send({ error: 'user not found' })
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
      return res.status(400).send({ error: 'user name is required and must be between 2 and 250 characters' })
    }

    if (picture && (picture.length < 2 || picture.length > 250)) {
      return res.status(400).send({ error: 'user picture must be between 2 and 250 characters' })
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

    return res.location(req.protocol + '://' + req.get('host') + '/users/' + user.id).status(201).send(user)
  })

// update
userController.put(
  '/:id',
  passport.authenticate('user', { session: false }),
  async (req, res) => {
    const name: string | null = req.body.name
    const picture: string | null = req.body.picture

    if (!name || name.length < 2 || name.length > 250) {
      return res.status(400).send({ error: 'user name is required and must be between 2 and 250 characters' })
    }

    if (picture && (picture.length < 2 || picture.length > 250)) {
      return res.status(400).send({ error: 'user picture must be between 2 and 250 characters' })
    }

    const groupName: string = (req.user as AuthenticatedUsed).group

    if (!await db.user.count({ where: { id: req.params.id, groups: { some: { groupName: groupName } } } })) {
      return res.status(404).send({ error: 'User not found' })
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

    return res.status(204).send()
  })
