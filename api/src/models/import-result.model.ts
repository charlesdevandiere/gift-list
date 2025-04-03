export interface ImportResult {
  success?: {
    importedUsers: Record<string, 'already exists' | 'imported'>
    importedGifts: Record<string, number>
  }
  error?: string
}
