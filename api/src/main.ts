import express, { Request, Response, json, urlencoded } from 'express'
import ExpressOAuthServer from "express-oauth-server"
import { Model } from './oauth/model'
import { DB } from './oauth/db'

const app = express()
const port = 3000

const db = new DB()
const model = new Model(db)

const oauth = new ExpressOAuthServer({
  model: model
})

app.use(json())
app.use(urlencoded({ extended: false }))
app.use(oauth.authorize())

app.use(function(req, res) {
  res.send('Secret area')
})

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server running: http://localhost:${port}`)
})
