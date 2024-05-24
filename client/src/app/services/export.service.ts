import { formatDate } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import * as Papa from 'papaparse';
import { firstValueFrom } from 'rxjs';
import { CsvGift } from '../models/csv-gift.model';
import { Gift } from '../models/gift.model';
import { User } from '../models/user.model';
import { AppTranslations } from '../utils/app-translations';
import { AuthService } from './auth.service';
import { GiftsService } from './gifts.service';
import { ToastsService } from './toasts.service';
import { UsersService } from './users.service';

@Injectable()
export class ExportService {

  public constructor(
    private authService: AuthService,
    private giftsService: GiftsService,
    private toastsService: ToastsService,
    private translations: AppTranslations,
    private usersService: UsersService,
    @Inject(LOCALE_ID) private locale: string) { }

  public async export(): Promise<void> {
    try {
      const users: User[] = await firstValueFrom(this.usersService.getUsers({ noCache: true }));

      const gifts: CsvGift[] = [];

      for (const user of users) {
        const userGifts: Gift[] = await firstValueFrom(this.giftsService.getUserGifts(user.id, { noCache: true }));

        gifts.push(...userGifts.map((gift: Gift): CsvGift => {
          return {
            user: user.name,
            gift: gift.name,
            link1: gift.link1 ?? '',
            link2: gift.link2 ?? '',
            link3: gift.link3 ?? ''
          };
        }));
      }

      const csv: string = Papa.unparse(gifts, { delimiter: ';' });
      const filename = `giftlist_${this.authService.group ?? ''}_${formatDate(new Date(), 'yyyy-MM-dd', this.locale)}.csv`;
      this.download(csv, filename, 'text/csv');
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
