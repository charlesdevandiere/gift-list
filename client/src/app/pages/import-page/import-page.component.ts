import { KeyValuePipe } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { ChangeDetectionStrategy, Component, inject, LOCALE_ID, Signal, signal } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ImportResult } from '../../models/import-result.model'
import { ColorModesService, Theme } from '../../services/color-modes.service'

type Step = 'select-file' | 'importing' | 'finished'

@Component({
  selector: 'app-import-page',
  templateUrl: './import-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [KeyValuePipe, RouterModule]
})
export class ImportPageComponent {
  protected readonly locale = inject(LOCALE_ID)
  private readonly colorModeService = inject(ColorModesService)
  private readonly http = inject(HttpClient)

  protected readonly theme: Signal<Theme> = this.colorModeService.theme
  protected readonly file = signal<File | undefined>(undefined)
  protected readonly step = signal<Step>('select-file')
  protected readonly result = signal<ImportResult | null>(null)

  public selectFile(event: { target: { files: File[] } | null }): void {
    this.file.set(event.target?.files[0])
  }

  protected import(): void {
    const file = this.file()
    if (!file) {
      throw new Error('File required.')
    }

    this.step.set('importing')

    const formData = new FormData()
    formData.append('file', file)
    this.http.post<ImportResult>('/api/import', formData)
      .subscribe(result => {
        this.step.set('finished')
        this.result.set(result)
      })
  }

}
