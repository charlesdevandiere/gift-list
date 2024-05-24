import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import * as Papa from 'papaparse';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { CsvGift } from 'src/app/models/csv-gift.model';
import { Gift } from 'src/app/models/gift.model';
import { User } from 'src/app/models/user.model';
import { ExportService } from 'src/app/services/export.service';
import { GiftsService } from 'src/app/services/gifts.service';
import { UsersService } from 'src/app/services/users.service';
import { AppTranslations } from 'src/app/utils/app-translations';
import { v4 } from 'uuid';

type Step = 'select-file' | 'importing' | 'finish';
interface State {
  step: Step;
  progress: number;
  logs: string
};

@Component({
  selector: 'app-import-export-page',
  templateUrl: './import-export-page.component.html',
  styleUrls: ['./import-export-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [AsyncPipe, RouterModule],
  providers: [ExportService]
})
export class ImportExportPageComponent implements OnDestroy {

  protected file: File | undefined = undefined;

  protected readonly state$: Observable<State>;

  private readonly _state$: BehaviorSubject<State> = new BehaviorSubject<State>({ step: 'select-file', progress: 0, logs: '' });

  public constructor(
    public translations: AppTranslations,
    private exportService: ExportService,
    private giftsService: GiftsService,
    private usersService: UsersService) {
    this.state$ = this._state$.asObservable();
  }

  public ngOnDestroy(): void {
    this._state$.complete();
  }

  public selectFile(event: { target: { files: File[] } | null }): void {
    this.file = event.target?.files[0];
  }

  protected import(): void {
    if (!this.file) {
      throw new Error('File required.');
    }

    this.changeStep('importing');

    const reader = new FileReader();
    reader.addEventListener('load', (e) => {
      if (typeof e?.target?.result == 'string') {
        const fileContent: string = e.target.result.replace('ï»¿', '');
        const csv: Papa.ParseResult<CsvGift> = Papa.parse<CsvGift>(fileContent, { delimiter: ';', header: true, skipEmptyLines: true });
        this.importCsvData(csv.data)
          .then(() => this.changeStep('finish'))
          .catch(() => this.changeStep('finish'));
      }
    });
    reader.readAsText(this.file);
  }

  protected async export(): Promise<void> {
    await this.exportService.export();
  }

  private log(message: string): void {
    const logs = this._state$.value.logs
      ? this._state$.value.logs + '\n' + message
      : this._state$.value.logs + message;
    this._state$.next({
      ...this._state$.value,
      logs: logs
    });
  }

  private changeStep(step: Step): void {
    this._state$.next({
      ...this._state$.value,
      step: step
    });
  }

  private changeProgress(progress: number): void {
    if (progress < 0 || progress > 100) {
      throw new Error('Invalid progress value.');
    }

    this._state$.next({
      ...this._state$.value,
      progress: progress
    });
  }

  private async importCsvData(data: CsvGift[]): Promise<void> {
    const existingUsers: User[] = await firstValueFrom(this.usersService.getUsers());
    const users: User[] = [];

    for (const item of data) {
      let user: User | undefined = users.find(u => u.name == item.user);
      if (!user) {
        user = existingUsers.find(u => u.name == item.user) ?? { id: v4(), name: item.user, picture: '' };
        users.push(user);
      }
      user.gifts = user.gifts ?? [];
      if (item.gift) {
        const gift: Gift = {
          id: v4(),
          name: item.gift,
          user_id: user.id,
          link1: item.link1,
          link2: item.link2,
          link3: item.link3
        };
        user.gifts.push(gift);
      }
    }

    await this.importUsers(users);
    this.log('');
    await this.importGifts(users);
  }

  private async importUsers(users: User[]): Promise<void> {
    this.log('Importing users:');
    const report = await firstValueFrom(this.usersService.importUsers(users));
    const userNamesMaxLength: number = Math.max(...users.map(user => user.name.length));

    for (const user of users) {
      const state: string = report.existing_users.some(u => u.id == user.id)
        ? '╌ already exists'
        : report.new_users.some(u => u.id == user.id)
          ? '✓ imported'
          : '✗ not imported';
      const sizeDiff: number = userNamesMaxLength - user.name.length;
      this.log(`  ${user.name}${' '.repeat(sizeDiff)}  ${state}`);
    }

    this.changeProgress(Math.round(100 / (users.length + 1)));
  }

  private async importGifts(users: User[]): Promise<void> {
    this.log('Importing gifts:');
    const userNamesMaxLength: number = Math.max(...users.map(user => user.name.length));
    for (let i = 0; i < users.length; i++) {
      const user: User | undefined = users[i];
      if (user?.gifts) {
        const sizeDiff: number = userNamesMaxLength - user.name.length;
        try {
          const report = await firstValueFrom(this.giftsService.importGifts(user.id, user.gifts));
          this.log(`  ${user.name}${' '.repeat(sizeDiff)}  ✓ ${report.new_gifts.length} gift(s) imported`);
        }
        catch (error) {
          this.log(`  ${user.name}${' '.repeat(sizeDiff)}  ✗ gifts not imported`);
          console.error(`An error occured while trying to import gifts of ${user.name}.`, error);
        }
      }

      this.changeProgress(Math.round((100 / (users.length + 1)) * (i + 2)));
    }

    this.changeProgress(100);
  }

}
