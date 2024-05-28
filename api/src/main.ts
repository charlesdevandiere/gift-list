import express, { Request, Response, json, urlencoded } from 'express'
import passport from 'passport'
import { BasicStrategy, BasicVerifyFunction } from 'passport-http'
import { findByToken } from './auth/db'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { authenticate } from './auth'

dotenv.config()

const verify: BasicVerifyFunction = (username: string, password: string, done: (error: any, user?: any) => void) => {
  authenticate(username, password, (err, user) => {
    if (err) { return done(err) }
    if (!user) { return done(null, false) }
    return done(null, user)
  }).then()
}

passport.use(new BasicStrategy(authenticate))

const app = express()
const port = process.env.PORT

app.use(morgan('combined'))
app.use(json())
app.use(urlencoded({ extended: false }))

app.get('/',
  passport.authenticate('basic', { session: false }),
  (req, res) => {
    res.json(req.user)
  })

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
