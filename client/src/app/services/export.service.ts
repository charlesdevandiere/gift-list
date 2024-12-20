import { formatDate } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { AppTranslations } from '../utils/app-translations';
import { AuthService } from './auth.service';
import { ToastsService } from './toasts.service';

@Injectable()
export class ExportService {

  public constructor(
    private readonly authService: AuthService,
    private readonly toastsService: ToastsService,
    private readonly translations: AppTranslations,
    @Inject(LOCALE_ID) private readonly locale: string) { }

  public async export(): Promise<void> {
    try {
      // TODO: download CSV from API
      await Promise.resolve();
      const filename = `giftlist_${this.authService.group ?? ''}_${formatDate(new Date(), 'yyyy-MM-dd', this.locale)}.csv`;
      this.download('', filename, 'text/csv');
    }
    catch (err) {
      console.error(err);
      this.toastsService.show(this.translations.misc.error, { severity: 'danger' });
    }
  }

  private download(data: string, filename: string, type: string): void {
    const file = new Blob([data], { type: type });
    const a = document.createElement("a");
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(
      () => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      0
    );
  }
}
