
import { Client, ClientCredentialsModel, Falsey, RefreshToken, Token, User } from 'oauth2-server'
import { DB } from './db'

export class Model implements ClientCredentialsModel {

  private readonly enabledScopes: string[] = ['read', 'write']
  private readonly getUserDoc = () => ({ id: 'system' })

  public constructor(private db: DB) { }

  public async getClient(clientId: string, clientSecret: string): Promise<Client | undefined> {
    return this.db.findClient(clientId, clientSecret)
  }

  public async validateScope(user: User, client: Client, scope: string | string[]): Promise<string | string[] | Falsey> {
    if (!user || user.id !== 'system') {
      return false
    }

    if (!client || !this.db.findClientById(client.id)) {
      return false
    }

    if (typeof scope === 'string') {
      return this.enabledScopes.includes(scope) ? scope : false
    } else {
      return scope.every(s => this.enabledScopes.includes(s)) ? scope : false
    }
  }

  public async getUserFromClient(client: Client) {
    // In this setup we don't have any users, so
    // we return an object, representing a "system" user
    // and avoid creating any user documents.
    // The user document is nowhere relevant for accessing resources,
    // so we can safely use it like this.
    return this.db.findClient(client.id, client.secret) && this.getUserDoc()
  }

  public async saveToken(token: Token, client: Client, user: User): Promise<Token | Falsey> {
    const meta = {
      clientId: client.id,
      userId: user.id,
      scope: token.scope,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt
    }

    token.client = client
    token.user = user

    if (token.accessToken) {
      this.db.saveAccessToken(token.accessToken, meta)
    }

    if (token.refreshToken) {
      this.db.saveRefreshToken(token.refreshToken, meta)
    }

    return token
  }

  public async getAccessToken(accessToken: string): Promise<Token | Falsey> {
    const meta = this.db.findAccessToken(accessToken)

    if (!meta) {
      return false
    }

    const client: Client | undefined = this.db.findClientById(meta.clientId)

    if (!client) {
      return false
    }

    return {
      accessToken,
      accessTokenExpiresAt: meta.accessTokenExpiresAt,
      user: this.getUserDoc(),
      client: client,
      scope: meta.scope
    }
  }

  public async getRefreshToken(refreshToken: string): Promise<RefreshToken | Falsey> {
    const meta = this.db.findRefreshToken(refreshToken)

    if (!meta) {
      return false
    }

    const client: Client | undefined = this.db.findClientById(meta.clientId)

    if (!client) {
      return false
    }

    return {
      refreshToken,
      refreshTokenExpiresAt: meta.refreshTokenExpiresAt,
      user: this.getUserDoc(),
      client: client,
      scope: meta.scope
    }
  }

  public async revokeToken(token: RefreshToken): Promise<boolean> {
    this.db.deleteRefreshToken(token.refreshToken)

    return true
  }

  public async verifyScope(token: Token, scope: string | string[]): Promise<boolean> {
    if (typeof scope === 'string') {
      return this.enabledScopes.includes(scope)
    } else {
      return scope.every(s => this.enabledScopes.includes(s))
    }
  }

}
