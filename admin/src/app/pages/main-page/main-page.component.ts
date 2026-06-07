import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Group } from '../../models/group';
import { GroupsService } from '../../services/groups.service';

@Component({
  selector: 'app-main-page',
  imports: [],
  templateUrl: './main-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent {
  private readonly groupsService = inject(GroupsService)

  protected readonly groups = signal<Group[]>([])

  public constructor() {
    this.groupsService.getGroups().subscribe(groups => this.groups.set(groups))
  }

  protected openChangePasswordModal(group: Group): void {
    console.log('open change password modal', group)
  }

  protected deleteGroup(group: Group): void {
    console.log('delete group', group)
  }

}
