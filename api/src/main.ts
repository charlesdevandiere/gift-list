import dotenv from 'dotenv'
import express, { json, urlencoded } from 'express'
import { readFileSync } from 'fs'
import helmet from 'helmet'
import morgan from 'morgan'
import passport from 'passport'
import { serve, setup } from 'swagger-ui-express'
import * as YAML from 'yaml'
import { AdminStrategy, UserStrategy } from './auth'
import { groupController } from './controllers/group.controller'
import { logger } from './logger'
import { userController } from './controllers/user.controller'

dotenv.config()

const app = express()
app.use(helmet())
app.use(morgan('combined'))
app.use(json())
app.use(urlencoded({ extended: false }))

// swagger
if (process.env.NODE_ENV === 'development') {
  const openapiFile = readFileSync('./openapi.yaml', 'utf8')
  const swaggerDocument = YAML.parse(openapiFile)

  app.use('/swagger', serve, setup(swaggerDocument));
}

// authentication
passport.use('admin', AdminStrategy)
passport.use('user', UserStrategy)

// controllers
app.use('/groups', groupController)
app.use('/users', userController)


const port = process.env.PORT
app.listen(port, () => {
  logger.info(`⚡️[server]: Server is running at http://localhost:${port}/swagger`)
})
