import { Router } from 'express'
import passport from 'passport'
import { db } from '../db'
import { Group } from '@prisma/client'
import { logger } from '../logger'
import { genSalt, hash } from 'bcrypt'

export const groupController = Router()

// list
groupController.get(
  '/',
  passport.authenticate('admin', { session: false }),
  async (req, res) => {
    const groups = await db.group.findMany({ select: { name: true } })
    res.send(groups)
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
      res.send(group)
    }
    else {
      res.status(404).send()
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
      res.status(400).send({ error: 'group name must be between 2 and 50 characters' })
      return
    }

    if (!password || password.length < 4 || password.length > 18) {
      res.status(400).send({ error: 'group password must be between 4 and 18 characters' })
      return
    }

    if (await db.group.count({ where: { name: name } })) {
      res.status(409).send({ error: 'group already exists' })
      return
    }

    const group: Group = {
      name: name,
      password: password
    }

    await db.group.create({ data: group })
    logger.info(`Group '${name}' created`)

    res.location('/' + name).status(201).send({ name: name })
  })

// change password
groupController.put(
  '/:name',
  passport.authenticate('admin', { session: false }),
  async (req, res) => {
    if (!req.body.password || req.body.password.length < 4 || req.body.password.length > 18) {
      res.status(400).send({ error: 'group password must be between 4 and 18 characters' })
      return
    }

    const group = await db.group.findFirst({
      where: { name: req.params.name }
    })

    if (!group) {
      res.status(404).send()
      return
    }

    const salt: string = await genSalt()
    const password: string = await hash(req.body.password, salt)

    await db.group.update({
      where: { name: req.params.name },
      data: { password: password }
    })

    logger.info(`Group '${req.params.name}' has updated`)

    res.status(204).send()
  })

// delete
groupController.delete(
  '/:name',
  passport.authenticate('admin', { session: false }),
  async (req, res) => {
    if ((await db.group.count({ where: { name: req.params.name } })) == 0) {
      res.status(404).send()
      return
    }

    await db.group.delete({
      where: { name: req.params.name }
    })

    res.status(204).send()
  })
