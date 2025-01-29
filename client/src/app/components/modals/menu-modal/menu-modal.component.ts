import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChangeUserComponent } from '../../change-user/change-user.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { User } from '../../../models/user.model';
import { AppTranslations } from '../../../utils/app-translations';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';

export type MenuPage = 'main' | 'change-user'

interface State {
  user: User | null;
  page: MenuPage;
};

@Component({
  selector: 'app-menu-modal',
  imports: [AsyncPipe, ChangeUserComponent, MainMenuComponent],
  templateUrl: './menu-modal.component.html',
  styleUrl: './menu-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuModalComponent implements OnDestroy, OnInit {

  private readonly _state$: BehaviorSubject<State> = new BehaviorSubject<State>({ user: null, page: 'main' });

  protected readonly state$: Observable<State | null> = this._state$.asObservable();

  protected readonly users$: Observable<User[]> = this.usersService.getUsers();

  protected selectedUser: User | null = null;

  public constructor(
    public readonly modal: NgbActiveModal,
    public readonly translations: AppTranslations,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly router: Router) { }

  public ngOnInit(): void {
    if (this.authService.me?.id) {
      this.usersService.getUser(this.authService.me?.id)
        .subscribe((user: User) => {
          this._state$.next({
            ...this._state$.value,
            user: user
          });
        });
    }
  }

  public ngOnDestroy(): void {
    this._state$.complete();
  }

  protected async changeUser(user: User | null): Promise<void> {
    this.authService.setCurrentUser(user?.id ?? null);
    this._state$.next({
      ...this._state$.value,
      user: user,
      page: 'main'
    });
    await this.router.navigate(['/']);
  }

  protected dismiss(): void {
    this.modal.dismiss();
  }

  protected move(page: MenuPage): void {
    this._state$.next({
      ...this._state$.value,
      page: page
    });
  }

}
