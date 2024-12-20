import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ExportService } from '../../services/export.service';
import { AppTranslations } from '../../utils/app-translations';

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
  imports: [AsyncPipe, RouterModule],
  providers: [ExportService]
})
export class ImportExportPageComponent implements OnDestroy {

  protected file: File | undefined = undefined;

  protected readonly state$: Observable<State>;

  private readonly _state$: BehaviorSubject<State> = new BehaviorSubject<State>({ step: 'select-file', progress: 0, logs: '' });

  public constructor(
    public translations: AppTranslations,
    private readonly exportService: ExportService) {
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

    // TODO: upload CSV file
    this.changeStep('finish')
  }

  protected async export(): Promise<void> {
    await this.exportService.export();
  }

  private changeStep(step: Step): void {
    this._state$.next({
      ...this._state$.value,
      step: step
    });
  }

}
