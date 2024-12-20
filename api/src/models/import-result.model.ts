export interface ImportResult {
  success?: {
    importedUser: Record<string, 'already exists' | 'imported'>
    importedGift: Record<string, number>
  }
  error?: string
}
