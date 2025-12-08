import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from '../../models/user.model';
import { ToastsService } from '../../services/toasts.service';
import { UsersService } from '../../services/users.service';

@Injectable()
export class MainPageService {
  private readonly toastsService = inject(ToastsService)
  private readonly usersService = inject(UsersService)

  public readonly loadingUsers = signal<boolean>(false)
  public readonly users = signal<User[]>([])
  public readonly userId = signal<string | null>(null)
  public readonly selectedUser = computed<User | undefined>(
    () => this.users().find(user => user.id === this.userId())
  )

  public async loadUsers(): Promise<void> {
    this.loadingUsers.set(true)
    try {
      this.users.set(await firstValueFrom(this.usersService.getUsers()))
    } catch (err) {
      console.error(err)
      this.toastsService.show(
        $localize`:@@mainPage.loadError:A error occurred while loading users.`,
        { severity: 'danger' }
      )
    }
    this.loadingUsers.set(false)
  }

  public reorder(id: string, direction: 'up' | 'down'): void {
    this.users.update((users: User[]) => {
      const from: number = users.findIndex(gift => gift.id == id)
      const user: User | undefined = users.splice(from, 1)[0]
      if (!user) {
        throw new Error(`Unable to reorder user ${id}.`)
      }
      const to: number = direction == 'up' ? from - 1 : from + 1
      users.splice(to, 0, user)
      return users
    })
  }

  public async saveOrder(): Promise<void> {
    await firstValueFrom(this.usersService.reorderUsers(this.users()))
    await this.loadUsers()
  }

}
