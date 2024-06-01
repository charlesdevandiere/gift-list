import { Router } from 'express'
import passport from 'passport'
import { db } from '../db'
import { Group } from '@prisma/client'
import winston from 'winston'

export const groupController = Router()

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     adminAuth:
 *       type: http
 *       scheme: basic
 *   schemas:
 *     Group:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The group name
 *       example:
 *         name: Jedi order
 *     CreateGroup:
 *       type: object
 *       required:
 *         - name
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: The group name
 *         password:
 *           type: string
 *           description: The group password
 *       example:
 *         name: Jedi order
 *         password: maythe4bewithyou
 *     UpdateGroup:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         password:
 *           type: string
 *           description: The group password
 *       example:
 *         password: maythe4bewithyou
 */

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: The groups
 * /groups:
 *   get:
 *     summary: Lists all the groups
 *     tags: [Groups]
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: The list of the groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGroup'
 *     responses:
 *       201:
 *         description: The created group.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       500:
 *         description: Some server error
 * /groups/{name}:
 *   get:
 *     summary: Get the group by name
 *     tags: [Groups]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The group name
 *     responses:
 *       200:
 *         description: The group
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       404:
 *         description: The group was not found
 *   put:
 *     summary: Update the group by the id
 *     tags: [Groups]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The group name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGroup'
 *     responses:
 *       204:
 *         description: The group was updated
 *       404:
 *         description: The group was not found
 *       500:
 *         description: Some error happened
 *   delete:
 *     summary: Remove the group by name
 *     tags: [Groups]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The book name
 *
 *     responses:
 *       204:
 *         description: The group was deleted
 *       404:
 *         description: The group was not found
 */

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
    winston.info(`Group '${name}' created`)

    res.location(name).status(201).send({ name: name })
  }
)
