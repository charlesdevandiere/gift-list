import { Group } from '@prisma/client'
import { compare } from 'bcrypt'
import { BasicStrategy } from 'passport-http'
import { db } from './db'
import { logger } from './logger'

export interface AuthenticatedUsed { group: string, id?: string, anonymous: boolean }

async function authenticateUser(username: string, password: string, done: (error: any, user?: any) => void): Promise<void> {
  try {
    const userInfo: string[] = username.split('@')
    const groupName: string = userInfo[0]
    const userId: string = userInfo[1]

    const group: Group = await db.group.findUniqueOrThrow({
      where: { name: groupName }
    })
    if (!await compare(password, group.password)) {
      throw new Error('wrong password')
    }

    const user: { id: string } | null = userId
      ? await db.user.findUniqueOrThrow({
        select: { id: true },
        where: { id: userId, groups: { some: { groupName: groupName } } }
      })
      : null

    const authenticateUser: AuthenticatedUsed = {
      group: group.name,
      id: user?.id,
      anonymous: !user
    }

    return done(null, authenticateUser)
  }
  catch (err) {
    logger.error('authentication failed', err)
    return done(null, null)
  }
}

async function authenticateAdmin(username: string, password: string, done: (error: any, user?: any) => void): Promise<void> {
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

    return done(null, { name: 'admin' })
  }
  catch (err) {
    logger.error('authentication failed', err)
    return done(null, null)
  }
}

export const UserStrategy = new BasicStrategy({ realm: 'user' }, authenticateUser)
export const AdminStrategy = new BasicStrategy({ realm: 'admin' }, authenticateAdmin)
