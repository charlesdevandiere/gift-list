import { formatDate } from '@angular/common'
import { HttpClient, HttpResponse } from '@angular/common/http'
import { Injectable, LOCALE_ID, inject } from '@angular/core'
import { AppTranslations } from '../utils/app-translations'
import { AuthService } from './auth.service'
import { ToastsService } from './toasts.service'

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private readonly authService = inject(AuthService)
  private readonly http = inject(HttpClient)
  private readonly toastsService = inject(ToastsService)
  private readonly translations = inject(AppTranslations)
  private readonly locale = inject(LOCALE_ID)

  public export(): void {
    this.http.get('/api/export', { responseType: 'blob', observe: 'response' })
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          const file = response.body
          const filename = this.getFilename(response)
          if (file) {
            this.download(file, filename)
          }
        },
        error: (err) => {
          console.error(err)
          this.toastsService.show(this.translations.misc.error, { severity: 'danger' })
        }
      })
  }

  private download(file: Blob, filename: string): void {
    const anchor = document.createElement("a")
    const url = URL.createObjectURL(file)
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    setTimeout(
      () => {
        anchor.remove()
        globalThis.URL.revokeObjectURL(url)
      },
      0
    )
  }

  private getFilename(response: HttpResponse<Blob>): string {
    const contentDisposition = response.headers.get('content-disposition') ?? ''
    const regexMatch = /^attachment filename="?(?<filename>[a-zA-Z0-9_\-\s.]+)"?$/g.exec(contentDisposition)
    const filename = regexMatch?.groups?.['filename']
      ?? `giftlist_${this.authService.group ?? ''}_${formatDate(new Date(), 'yyyy-MM-dd', this.locale)}.csv`

    return filename.replace(/[\s<>:"/\\|?*]/, '_') // replace forbidden characters
  }
}
