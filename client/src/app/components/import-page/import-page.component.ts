import { AsyncPipe } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ImportResult } from '../../models/import-result.model';
import { AppTranslations } from '../../utils/app-translations';

type Step = 'select-file' | 'importing' | 'finish';
interface State {
  step: Step;
  progress: number;
  logs: string
};

@Component({
  selector: 'app-import-page',
  templateUrl: './import-page.component.html',
  styleUrls: ['./import-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterModule]
})
export class ImportPageComponent implements OnDestroy {

  protected file: File | undefined = undefined;

  protected readonly state$: Observable<State>;

  private readonly _state$: BehaviorSubject<State> = new BehaviorSubject<State>({ step: 'select-file', progress: 0, logs: '' });

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

    this.changeStep('importing');

    const formData = new FormData();
    formData.append('file', this.file);
    this.http.post<ImportResult>('/api/import', formData, {
      reportProgress: true,
      observe: 'events'
    })
      .subscribe(event => {
        console.log(event)
        if (event.type == HttpEventType.UploadProgress) { // not work
          this.changeProgress(Math.round(100 * (event.loaded / (event.total ?? 1))))
        }
        else if (event.type == HttpEventType.Response) {
          this.changeStep('finish')
          this._state$.next({
            ...this._state$.value,
            logs: JSON.stringify(event.body)
          });
        }
      })
  }

  private changeStep(step: Step): void {
    this._state$.next({
      ...this._state$.value,
      step: step
    });
  }

  private changeProgress(progress: number): void {
    console.log(progress)
    this._state$.next({
      ...this._state$.value,
      progress: progress
    });
  }

}
