import dotenv from 'dotenv'
import express, { json, urlencoded } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import passport from 'passport'
import { BasicStrategy } from 'passport-http'
import { authenticate } from './auth'

dotenv.config()

passport.use(new BasicStrategy(authenticate))

const app = express()
app.use(helmet())
app.use(morgan('combined'))
app.use(json())
app.use(urlencoded({ extended: false }))

app.get('/',
passport.authenticate('basic', { session: false }),
(req, res) => {
  res.json(req.user)
})

const port = process.env.PORT
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
