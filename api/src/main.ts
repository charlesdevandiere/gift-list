import { User } from '@prisma/client'
import express, { json, urlencoded } from 'express'
import { readFileSync } from 'fs'
import helmet from 'helmet'
import morgan from 'morgan'
import passport from 'passport'
import { JsonObject, serve, setup } from 'swagger-ui-express'
import * as YAML from 'yaml'
import { AdminStrategy, AuthenticatedUsed, UserStrategy } from './auth'
import { cartController } from './controllers/cart.controller'
import { exportController } from './controllers/export.controller'
import { giftController } from './controllers/gift.controller'
import { groupController } from './controllers/group.controller'
import { importController } from './controllers/import.controller'
import { userController } from './controllers/user.controller'
import { db } from './db'
import { logger } from './logger'
import { errorHandler } from './error-handler'
import cors from 'cors'

const app = express()
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "script-src-attr": ["'unsafe-inline'"]
    },
  },
}))
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cors({
    origin: 'http://localhost:4200'
  }))
}
app.use(morgan(
  ':remote-addr :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms',
  { stream: { write: (message) => logger.http(message.trimEnd()) } }))
app.use((req, res, next) => {
  json()(req, res, err => {
    if (err) {
      logger.error(err)
      return res.status(400).send({ error: 'Invalid JSON' })
    }

    next()
  })
})
app.use(urlencoded({ extended: false }))

// swagger
if (process.env.NODE_ENV === 'development') {
  const openapiFile = readFileSync('./openapi.yaml', 'utf8')
  const swaggerDocument = YAML.parse(openapiFile) as JsonObject

  app.use('/swagger', serve, setup(swaggerDocument))
}

// authentication
passport.use('admin', AdminStrategy)
passport.use('user', UserStrategy)

app.get(
  '/api/me',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  passport.authenticate('user', { session: false }),
  async (req, res) => {
    const group: string = (req.user as AuthenticatedUsed).group
    const userId: string | undefined = (req.user as AuthenticatedUsed).id

    const me: { group: string, name?: string, id?: string, picture?: string | null } = {
      group: group
    }

    if (userId) {
      const user: User | null = await db.user.findUnique({
        where: { id: userId, groups: { some: { groupName: group } } }
      })

      if (user) {
        me.id = user.id
        me.name = user.name
        me.picture = user.picture
      }
    }

    res.status(200).send(me)
  })

// controllers
app.use('/api/', groupController)
app.use('/api/', userController)
app.use('/api/', giftController)
app.use('/api/', cartController)
app.use('/api/', exportController)
app.use('/api/', importController)

// client
app.use(express.static(`${process.cwd()}/www`))
app.use((_req, res) => {
  res.sendFile(`${process.cwd()}/www/index.html`)
})

// error handler
app.use(errorHandler)

const port: number = +(process.env.PORT ?? 0)
app.listen(port, () => {
  logger.info(`⚡️[server]: Server is running at http://localhost:${port}`)
})
