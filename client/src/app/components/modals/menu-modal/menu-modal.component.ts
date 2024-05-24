import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { UsersService } from 'src/app/services/users.service';
import { AppTranslations } from 'src/app/utils/app-translations';
import { ChangeUserComponent } from '../../change-user/change-user.component';
import { MainMenuComponent } from './main-menu/main-menu.component';

export type MenuPage = 'main' | 'change-user'

interface State {
  user: User | null;
  page: MenuPage;
};

@Component({
  selector: 'app-menu-modal',
  standalone: true,
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
    public modal: NgbActiveModal,
    public translations: AppTranslations,
    private authService: AuthService,
    private usersService: UsersService,
    private router: Router) { }

  public ngOnInit(): void {
    if (this.authService.userId) {
      this.usersService.getUser(this.authService.userId)
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
