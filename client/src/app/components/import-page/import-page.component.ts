import { AsyncPipe, KeyValuePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ImportResult } from '../../models/import-result.model';
import { AppTranslations } from '../../utils/app-translations';

type Step = 'select-file' | 'importing' | 'finished';
interface State {
  step: Step;
  result?: ImportResult
};

@Component({
  selector: 'app-import-page',
  templateUrl: './import-page.component.html',
  styleUrls: ['./import-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, KeyValuePipe, RouterModule]
})
export class ImportPageComponent implements OnDestroy {

  protected file: File | undefined = undefined;

  protected readonly state$: Observable<State>;

  private readonly _state$: BehaviorSubject<State> = new BehaviorSubject<State>({ step: 'select-file' });

  public constructor(
    public translations: AppTranslations,
    private readonly http: HttpClient) {
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

    this._state$.next({
      step: 'importing'
    });

    const formData = new FormData();
    formData.append('file', this.file);
    this.http.post<ImportResult>('/api/import', formData)
      .subscribe(result =>
        this._state$.next({
          step: 'finished',
          result: result
        }))
  }

}
