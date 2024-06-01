import { Group, User } from '@prisma/client'
import { BasicStrategy } from 'passport-http'
import { db } from './db'
import { compare } from 'bcrypt'
import { logger } from './logger'

async function authenticateUser(username: string, password: string, done: (error: any, user?: any) => void): Promise<void> {
  try {
    const userInfo: string[] = username.split('@')
    const groupName: string = userInfo[0]
    const userId: string = userInfo[1]

    const group: Group = await db.group.findUniqueOrThrow({ where: { name: groupName } })
    if (!await compare(password, group.password)) {
      throw new Error('wrong password')
    }

    const user: User | null = userId
      ? await db.user.findUniqueOrThrow({ where: { id: userId, groups: { some: { groupName: groupName } } } })
      : null

    return done(null, { group: group.name, id: user?.id, anonymous: !user })
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
