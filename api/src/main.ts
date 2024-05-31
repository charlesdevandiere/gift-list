import dotenv from 'dotenv'
import express, { json, urlencoded } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import passport from 'passport'
import winston, { createLogger, format } from 'winston'
import { AdminStrategy, UserStrategy } from './auth'
import { groupController } from './controllers/group.controller'

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

const app = express()
app.use(helmet())
app.use(morgan('combined'))
app.use(json())
app.use(urlencoded({ extended: false }))

passport.use('admin', AdminStrategy)
passport.use('user', UserStrategy)

app.use('/group', groupController)

app.get('/', passport.authenticate('user', { session: false }), (req, res) => {
  res.json(req.user)
})

const port = process.env.PORT
app.listen(port, () => {
  logger.info(`⚡️[server]: Server is running at http://localhost:${port}`)
})
