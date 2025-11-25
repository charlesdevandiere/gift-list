import cors from 'cors'
import express, { json, urlencoded } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import passport from 'passport'
import { JsonObject, serve, setup } from 'swagger-ui-express'
import * as YAML from 'yaml'
import { AdminStrategy, UserStrategy } from './auth'
import { exportController } from './controllers/export.controller'
import { giftController } from './controllers/gift.controller'
import { groupController } from './controllers/group.controller'
import { importController } from './controllers/import.controller'
import { meController } from './controllers/me.controller'
import { userController } from './controllers/user.controller'
import { errorHandler } from './error-handler'
import { logger } from './logger'

const app = express()
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "script-src-attr": ["'unsafe-inline'"]
    },
  },
}))
if (process.env.NODE_ENV === 'development') {
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
const openapiFile = readFileSync('./openapi.yaml', 'utf8')
const swaggerDocument = YAML.parse(openapiFile) as JsonObject
app.use('/api/swagger', serve, setup(swaggerDocument))

// authentication
passport.use('admin', AdminStrategy)
passport.use('user', UserStrategy)

// controllers
app.use('/api/', groupController)
app.use('/api/', meController)
app.use('/api/', userController)
app.use('/api/', giftController)
app.use('/api/', exportController)
app.use('/api/', importController)

// client
app.use(express.static(path.join(process.cwd(), 'www')))
app.use(/^(?!\/api)(.*)$/, (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'www', 'index.html'))
})

// error handler
app.use(errorHandler)
app.use((_req, res, next) => {
  if (res.statusCode === 401) {
    res.removeHeader('WWW-Authenticate');
  }
  next()
})

const port: number = +(process.env.PORT ?? 0)
app.listen(port, () => {
  logger.info(`⚡️[server]: Server is running at http://localhost:${port}`)
})
