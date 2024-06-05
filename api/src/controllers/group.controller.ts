import { Router } from 'express'
import passport from 'passport'
import { db } from '../db'
import { Group } from '@prisma/client'
import { logger } from '../logger'
import { genSalt, hash } from 'bcrypt'
import 'express-async-errors'

export const groupController = Router()

// list
groupController.get(
  '/',
  passport.authenticate('admin', { session: false }),
  async (req, res) => {
    const groups = await db.group.findMany({ select: { name: true } })
    return res.send(groups)
  })

// get
groupController.get(
  '/:name',
  passport.authenticate('admin', { session: false }),
  async (req, res) => {
    const group = await db.group.findFirst({
      select: { name: true },
      where: { name: req.params.name }
    })

    if (group) {
      return res.send(group)
    }
    else {
      return res.status(404).send({ error: 'group not found'})
    }
  })

// create
groupController.post(
  '/',
  passport.authenticate('admin', { session: false }),
  async (req, res) => {
    const name: string | null = req.body.name
    const password: string | null = req.body.password

    if (!name || name.length < 2 || name.length > 50) {
      return res.status(400).send({ error: 'group name is required and must be between 2 and 50 characters' })
    }

    if (!password || password.length < 4 || password.length > 18) {
      return res.status(400).send({ error: 'group password is required and must be between 4 and 18 characters' })
    }

    if (await db.group.count({ where: { name: name } })) {
      return res.status(409).send({ error: 'group already exists' })
    }

    const group: Group = await db.group.create({ data: {
      name: name,
      password: password
    } })
    logger.info(`Group '${name}' created`)

    return res.location(req.protocol + '://' + req.get('host') + '/groups/' + encodeURI(group.name)).status(201).send({ name: group.name })
  })

// change password
groupController.put(
  '/:name',
  passport.authenticate('admin', { session: false }),
  async (req, res) => {
    if (!req.body.password || req.body.password.length < 4 || req.body.password.length > 18) {
      return res.status(400).send({ error: 'group password is required and must be between 4 and 18 characters' })
    }

    const group = await db.group.findFirst({
      where: { name: req.params.name }
    })

    if (!group) {
      return res.status(404).send()
    }

    const salt: string = await genSalt()
    const password: string = await hash(req.body.password, salt)

    await db.group.update({
      where: { name: req.params.name },
      data: { password: password }
    })

    logger.info(`Group '${req.params.name}' has updated`)

    return res.status(204).send()
  })

// delete
groupController.delete(
  '/:name',
  passport.authenticate('admin', { session: false }),
  async (req, res) => {
    if ((await db.group.count({ where: { name: req.params.name } })) == 0) {
      return res.status(404).send()
    }

    await db.group.delete({
      where: { name: req.params.name }
    })

    return res.status(204).send()
  })
