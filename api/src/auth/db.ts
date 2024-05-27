const store = [
  { name: 'john', password: '1234' },
  { name: 'will', password: '5678' },
]

export function findByToken(username: string, password: string, done: (error: any, user?: any) => void): void {
  for (const user of store) {
    if (username === user.name &&
      password === user.password
    ) {
      return done(null, { name: user.name })
    }
  }
  return done(null, null)
}
