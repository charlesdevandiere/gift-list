export interface ImportResult {
  success?: {
    importedUser: { [user:string]: 'already exists' | 'imported' }
    importedGift: { [user:string]: number }
  }
  error?: string
}
