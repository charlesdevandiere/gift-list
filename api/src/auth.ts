import { compare } from 'bcrypt'
import { BasicStrategy } from 'passport-http'
import { db } from './db'
import { Group } from './generated/client'
import { logger } from './logger'
import passport from 'passport'
import { RequestHandler } from 'express'

export interface AuthenticatedUsed {
  group: string,
  id?: string,
  anonymous: boolean
}

async function authenticateUser(username: string, password: string, done: (error: unknown, user?: AuthenticatedUsed | false) => void): Promise<void> {
  try {
    const userInfo: string[] = username.split('@')
    const groupName: string = userInfo[0]
    const userId: string = userInfo[1]

    const group: Group | null = await db.group.findUnique({
      where: { name: groupName }
    })
    if (!group) {
      throw new Error('group not found')
    }
    if (!await compare(password, group.password)) {
      throw new Error('wrong password')
    }

    let user: { id: string } | null = null;
    if (userId) {
      user = await db.user.findUnique({
        select: { id: true },
        where: { id: userId, groups: { some: { groupName: groupName } } }
      })
      if (!user) {
        throw new Error('user not found')
      }
    }

    const authenticateUser: AuthenticatedUsed = {
      group: group.name,
      id: user?.id,
      anonymous: !user
    }

    done(null, authenticateUser)
  }
  catch (err) {
    logger.error('authentication failed', err)
    done(err, false)
  }
}

async function authenticateAdmin(username: string, password: string, done: (error: unknown, user?: { name: string } | false) => void): Promise<void> {
  try {
    if (username !== 'admin') {
      throw new Error('not admin')
    }

    if (typeof process.env.ADMIN_PASSWORD_HASH !== 'string') {
      throw new Error('admin password no configured')
    }

    if (!await compare(password, process.env.ADMIN_PASSWORD_HASH)) {
      throw new Error('wrong password')
    }

    done(null, { name: 'admin' })
  }
  catch (err) {
    logger.error('authentication failed', err)
    done(err, false)
  }
}

export const UserStrategy = new BasicStrategy({ realm: 'user' }, authenticateUser)
export const AdminStrategy = new BasicStrategy({ realm: 'admin' }, authenticateAdmin)

export function authenticate(strategy: string): RequestHandler {
  return (req, res, next) => {
    return (passport.authenticate(strategy, { session: false }, (err: unknown, user?: Express.User | null) => {
      if (!user) {
        const info = err instanceof Error ? { message: err.message } : null
        // send 401 without www-authenticate header to prevent browser auth dialog
        res.status(401).send(info)
      }
      else if (err) {
        next(err)
      }
      else {
        req.logIn(user, { session: false }, (err) => {
          if (err) next(err)
          else next()
        })
      }
    }) as RequestHandler)(req, res, next)
  }
}
