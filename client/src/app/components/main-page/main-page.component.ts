import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { UserGiftsComponent } from '../user-gifts/user-gifts.component';
import { UserListComponent } from '../user-list/user-list.component';
import { User } from '../../models/user.model';
import { AppTranslations } from '../../utils/app-translations';
import { ToastsService } from '../../services/toasts.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserListComponent, UserGiftsComponent, AsyncPipe]
})
export class MainPageComponent implements OnInit, OnDestroy {

  protected readonly loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  protected readonly selectedUser$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  protected users: User[] = [];

  protected userId: string | null = null;

  private readonly unsubscriber$: Subject<void> = new Subject<void>();

  public constructor(
    public translations: AppTranslations,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastsService: ToastsService,
    private readonly usersService: UsersService) { }

  public ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe((params: Params): void => {
        this.userId = params['user-id'] as string || null;
        this.getSelectedUser();
      });
    this.loadUsers();
  }

  public ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  private getSelectedUser(): void {
    const user: User | null = this.users.find(u => u.id === this.userId) ?? null;
    this.selectedUser$.next(user);
  }

  public refresh(): void {
    this.loadUsers();
  }

  public async selectUser(user: User): Promise<void> {
    if (this.selectedUser$.getValue() !== user) {
      await this.router.navigate(
        [],
        {
          relativeTo: this.route,
          queryParams: { 'user-id': user.id },
        });
    } else {
      await this.router.navigate([]);
    }
  }

  private loadUsers(): void {
    this.loading$.next(true);
    this.usersService.getUsers().subscribe({
      next: (users: User[]): void => {
        this.users = users;
        this.getSelectedUser();
        this.loading$.next(false);
      },
      error: (err) => {
        console.error(err);
        this.loading$.next(false);
        this.toastsService.show(this.translations.misc.error, { severity: 'danger' });
      }
    });
  }

}
