import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { MenuModalComponent } from './components/modals/menu-modal/menu-modal.component';
import { ToastsComponent } from './components/toasts/toasts.component';
import { Me } from './models/me.model';
import { AuthService } from './services/auth.service';
import { AppTranslations } from './utils/app-translations';

interface State {
  autheticated: boolean;
  me: Me | null;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    NgbDropdownModule,
    RouterLink,
    RouterOutlet,
    ToastsComponent,
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  protected state$: BehaviorSubject<State> = new BehaviorSubject<State>({ autheticated: false, me: null });

  private readonly _unsubscriber$: Subject<void> = new Subject<void>();

  public constructor(
    public translations: AppTranslations,
    private readonly authService: AuthService,
    private readonly modalService: NgbModal,
    title: Title) {
    title.setTitle(this.translations.title);
  }

  public ngOnInit(): void {
    this.authService.authenticated$
      .pipe(takeUntil(this._unsubscriber$))
      .subscribe((authenticated: boolean) => {
        const state: State = {
          ...this.state$.getValue(),
          autheticated: authenticated
        };
        this.state$.next(state);
      });
    this.authService.me$
      .pipe(takeUntil(this._unsubscriber$))
      .subscribe((me: Me | null) => {
        const state: State = {
          ...this.state$.getValue(),
          me: me
        };
        this.state$.next(state);
      });
  }

  public ngOnDestroy(): void {
    this._unsubscriber$.next();
    this._unsubscriber$.complete();
  }

  public openMenu(): void {
    this.modalService.open(MenuModalComponent, { scrollable: true });
  }

}
