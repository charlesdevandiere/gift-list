import { Router } from 'express'
import passport from 'passport'
import { db } from '../db'
import { Group } from '@prisma/client'
import { logger } from '../logger'

export const groupController = Router()

groupController.get(
  '/',
  passport.authenticate('admin', { session: false }),
  async (req, res) => {
    const groups = await db.group.findMany({ select: { name: true } })
    res.send(groups)
  })

groupController.post(
  '/',
  passport.authenticate('admin', { session: false }),
  async (req, res) => {
    const name: string | null = req.body.name
    const password: string | null = req.body.password

    if (!name || name.length < 2 || name.length > 50) {
      res.status(404).send({ error: 'group name must be between 2 and 50 characters' })
      return
    }

    if (!password || password.length < 4 || password.length > 18) {
      res.status(404).send({ error: 'group password must be between 4 and 18 characters' })
      return
    }

    if (await db.group.count({ where: { name: name } })) {
      res.status(409).send({ error: 'group already exists' })
    }

    const group: Group = {
      name: name,
      password: password
    }

    await db.group.create({ data: group })
    logger.info(`Group '${name}' created`)

    res.location(name).status(201).send({ name: name })
  }
)
