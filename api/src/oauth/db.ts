import { Client } from 'oauth2-server'

interface TokenMetadata {
  clientId: string
  userId: string
  scope?: string | string[]
  accessTokenExpiresAt?: Date
  refreshTokenExpiresAt?: Date
}

export class DB {

  private readonly clients: Client[] = []
  private readonly accessTokens = new Map<string, TokenMetadata>()
  private readonly refreshTokens = new Map<string, TokenMetadata>()

  public saveClient(client: Client): Client {
    this.clients.push(client)

    return client
  }

  public findClient(clientId: string, clientSecret: string): Client | undefined {
    return this.clients.find(client => {
      if (clientSecret) {
        return client.id === clientId && client.secret === clientSecret
      } else {
        return client.id === clientId
      }
    })
  }

  public findClientById(id: string): Client | undefined {
    return this.clients.find(client => client.id === id)
  }

  public saveAccessToken(accessToken: string, meta: TokenMetadata): void {
    this.accessTokens.set(accessToken, meta)
  }

  public findAccessToken(accessToken: string): TokenMetadata | undefined {
    return this.accessTokens.get(accessToken)
  }

  public deleteAccessToken(accessToken: string): void {
    this.accessTokens.delete(accessToken)
  }

  public saveRefreshToken(refreshToken: string, meta: TokenMetadata): void {
    this.refreshTokens.set(refreshToken, meta)
  }

  public findRefreshToken(refreshToken: string): TokenMetadata | undefined {
    return this.refreshTokens.get(refreshToken)
  }

  public deleteRefreshToken(refreshToken: string): void {
    this.refreshTokens.delete(refreshToken)
  }
}
