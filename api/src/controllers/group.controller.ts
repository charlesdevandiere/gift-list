import { genSalt, hash } from 'bcrypt'
import { RequestHandler, Router } from 'express'
import passport from 'passport'
import { db } from '../db'
import { Group } from '../generated/client'
import { logger } from '../logger'

export const groupController = Router()

// list
groupController.get(
  '/groups',
  passport.authenticate('admin', { session: false }) as RequestHandler,
  async (req, res) => {
    const groups: { name: string }[] = await db.group.findMany({ select: { name: true } })
    res.send(groups)
  })

// get
groupController.get(
  '/groups/:name',
  passport.authenticate('admin', { session: false }) as RequestHandler,
  async (req, res) => {
    const group: { name: string } | null = await db.group.findFirst({
      select: { name: true },
      where: { name: req.params.name }
    })

    if (group) {
      res.send(group)
    }
    else {
      res.status(404).send({ error: 'group not found' })
    }
  })

// create
groupController.post(
  '/groups',
  passport.authenticate('admin', { session: false }) as RequestHandler,
  async (req, res) => {
    const body = req.body as { name: string | null, password: string | null }

    if (!body.name || body.name.length < 2 || body.name.length > 50) {
      res.status(400).send({ error: 'group name is required and must be between 2 and 50 characters' })
      return
    }

    if (!body.password || body.password.length < 4 || body.password.length > 18) {
      res.status(400).send({ error: 'group password is required and must be between 4 and 18 characters' })
      return
    }

    if (process.env.MAX_NUMBER_OF_GROUPS) {
      const count: number = await db.group.count()
      if (count >= +process.env.MAX_NUMBER_OF_GROUPS) {
        res.status(400).send({ error: 'the maximum number of groups has already been reached' })
        return
      }
    }

    if (await db.group.count({ where: { name: body.name } })) {
      res.status(409).send({ error: 'group already exists' })
      return
    }

    const salt: string = await genSalt()
    const hashedPassword: string = await hash(body.password, salt)

    const group: Group = await db.group.create({
      data: {
        name: body.name,
        password: hashedPassword
      }
    })
    logger.info(`Group '${body.name}' created`)

    const host: string = req.get('host') ?? ''
    res.location(req.protocol + '://' + host + '/groups/' + encodeURI(group.name)).status(201).send({ name: group.name })
  })

// change password
groupController.put(
  '/groups/:name',
  passport.authenticate('admin', { session: false }) as RequestHandler,
  async (req, res) => {
    const body = req.body as { password: string | null }

    if (!body.password || body.password.length < 4 || body.password.length > 18) {
      res.status(400).send({ error: 'group password is required and must be between 4 and 18 characters' })
      return
    }

    const group: Group | null = await db.group.findFirst({
      where: { name: req.params.name }
    })

    if (!group) {
      res.status(404).send()
      return
    }

    const salt: string = await genSalt()
    const password: string = await hash(body.password, salt)

    await db.group.update({
      where: { name: req.params.name },
      data: { password: password }
    })

    logger.info(`Group '${req.params.name}' has updated`)

    res.status(204).send()
  })

// delete
groupController.delete(
  '/groups/:name',
  passport.authenticate('admin', { session: false }) as RequestHandler,
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
