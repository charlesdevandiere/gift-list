import dotenv from 'dotenv'
import express, { json, urlencoded } from 'express'
import 'express-async-errors'
import { readFileSync } from 'fs'
import helmet from 'helmet'
import morgan from 'morgan'
import passport from 'passport'
import { serve, setup } from 'swagger-ui-express'
import * as YAML from 'yaml'
import { AdminStrategy, UserStrategy } from './auth'
import { groupController } from './controllers/group.controller'
import { userController } from './controllers/user.controller'
import { logger } from './logger'
import { giftController } from './controllers/gift.controller'
import { importController } from './controllers/import.controller'
import { exportController } from './controllers/export.controller'
import { cartController } from './controllers/cart.controller'

dotenv.config()

const app = express()
app.use(helmet())
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
  const swaggerDocument = YAML.parse(openapiFile)

  app.use('/swagger', serve, setup(swaggerDocument))
}

// authentication
passport.use('admin', AdminStrategy)
passport.use('user', UserStrategy)

app.get(
  '/api/sign-in',
  passport.authenticate('user', { session: false }),
  (req, res) => {
    return res.status(200).send()
  })

// controllers
app.use('/api/', groupController)
app.use('/api/', userController)
app.use('/api/', giftController)
app.use('/api/', cartController)
app.use('/api/', exportController)
app.use('/api/', importController)

// error handler
app.use((err: Error, _req: any, res: any, _next: any): void => {
  console.error(err.stack)
  res.status(500).send({ error: 'Internal server error.' })
})

const port = process.env.PORT
app.listen(port, () => {
  logger.info(`⚡️[server]: Server is running at http://localhost:${port}/swagger`)
})
