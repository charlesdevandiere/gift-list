import dotenv from 'dotenv'
import express, { json, urlencoded } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import passport from 'passport'
import winston, { createLogger, format } from 'winston'
import { AdminStrategy, UserStrategy } from './auth'
import { groupController } from './controllers/group.controller'
import swaggerJSDoc from 'swagger-jsdoc'
import { serve, setup } from 'swagger-ui-express'

const port = process.env.PORT

dotenv.config()

const logger = createLogger({
  level: process.env.LOG_LEVEL ?? 'error',
  format: format.combine(
    format.splat(),
    format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
})

const specs = swaggerJSDoc({
  apis: ['./out-tsc/**/*.js'],
  definition: {
    openapi: '3.0.0',
    schema: {},
    info: {
      title: 'gift-list',
      version: '1.0.0'
    }
  }
})

const app = express()
app.use(helmet())
app.use(morgan('combined'))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(
  "/swagger",
  serve,
  setup(specs)
);

passport.use('admin', AdminStrategy)
passport.use('user', UserStrategy)

app.use('/groups', groupController)

app.get('/', passport.authenticate('user', { session: false }), (req, res) => {
  res.json(req.user)
})

app.listen(port, () => {
  logger.info(`⚡️[server]: Server is running at http://localhost:${port}/swagger`)
})
