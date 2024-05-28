import { Group, PrismaClient, User } from "@prisma/client"

export async function authenticate(username: string, password: string, done: (error: any, user?: any) => void): Promise<void> {
  const prisma = new PrismaClient()

  try {
    const userInfo: string[] = username.split('@')
    const groupName: string = userInfo[0]
    const userId: string = userInfo[1]

    const group: Group | null = await prisma.group.findUniqueOrThrow({ where: { name: groupName, password: password } })
    const user: User | null = userId
      ? await prisma.user.findUniqueOrThrow({ where: { id: userId } })
      : null

    return done(null, { group: group.name, id: user?.id, anonymous: !user })
  }
  catch (err) {
    console.error(err)
    await prisma.$disconnect()
    return done(null, null)
  }
}
