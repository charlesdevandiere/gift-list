import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { MenuModalComponent } from './components/modals/menu-modal/menu-modal.component';
import { ToastsComponent } from './components/toasts/toasts.component';
import { UserPageComponent } from './components/user-page/user-page.component';
import { User } from './models/user.model';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { AppTranslations } from './utils/app-translations';

interface State {
  autheticated: boolean;
  group: string | null;
  user: User | null;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    AsyncPipe,
    NgbDropdownModule,
    RouterLink,
    RouterOutlet,
    ToastsComponent,
    UserPageComponent,
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  protected state$: BehaviorSubject<State> = new BehaviorSubject<State>({ autheticated: false, group: null, user: null });

  private _unsubscriber$: Subject<void> = new Subject<void>();

  public constructor(
    public translations: AppTranslations,
    private authService: AuthService,
    private modalService: NgbModal,
    title: Title,
    private usersService: UsersService) {
    title.setTitle(this.translations.title);
  }

  public ngOnInit(): void {
    this.authService.authenticated$
      .pipe(takeUntil(this._unsubscriber$))
      .subscribe((authenticated: boolean) => {
        const state: State = {
          ...this.state$.getValue(),
          autheticated: authenticated,
          group: this.authService.group
        };
        this.state$.next(state);
      });
    this.authService.userId$
      .pipe(takeUntil(this._unsubscriber$))
      .subscribe((userId: string | null) => {
        if (userId) {
          this.usersService.getUser(userId)
            .subscribe((user: User) => {
              const state: State = {
                ...this.state$.getValue(),
                user: user
              };
              this.state$.next(state);
            });
        }
        else {
          const state: State = {
            ...this.state$.getValue(),
            user: null
          };
          this.state$.next(state);
        }
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
