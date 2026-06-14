import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { ChangePasswordModalComponent } from '../../modals/change-password-modal/change-password-modal.component';
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal.component';
import { ConfirmModalData } from '../../models/confirm-modal-data.model';
import { Group } from '../../models/group.model';
import { GroupsService } from '../../services/groups.service';
import { ToastsService } from '../../services/toasts.service';

@Component({
  selector: 'app-main-page',
  imports: [],
  templateUrl: './main-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent {
  private readonly groupsService = inject(GroupsService)
  private readonly modalService = inject(NgbModal)
  private readonly toastsService = inject(ToastsService)
  private readonly router = inject(Router)

  protected readonly groups = signal<Group[]>([])

  public constructor() {
    this.groupsService.getGroups().subscribe(groups => this.groups.set(groups))
  }

  protected async addGroup(): Promise<void> {
    await this.router.navigate(['/new-group'])
  }

  protected openChangePasswordModal(group: Group): void {
    const modal = this.modalService.open(ChangePasswordModalComponent)
    const component = modal.componentInstance as ChangePasswordModalComponent
    component.group.set(group)
  }

  protected async deleteGroup(group: Group): Promise<void> {
    const data: ConfirmModalData = {
      message: $localize`:@@mainPage.confirmDeleteGroup:Do you want to delete the "${group.name}:name:" group?`,
      yesButton: {
        color: 'danger',
        value: $localize`:@@mainPage.delete:Delete`
      }
    }
    const modal = this.modalService.open(ConfirmModalComponent)
    const component: ConfirmModalComponent = modal.componentInstance as ConfirmModalComponent
    component.data.set(data)
    try {
      await modal.result
      try {
        await firstValueFrom(
          this.groupsService.deleteGroup(group.name)
        )
        const groups = await firstValueFrom(
          this.groupsService.getGroups()
        )
        this.groups.set(groups)
      }
      catch (err) {
        console.error(err)
        this.toastsService.show(
          $localize`:@@mainPage.deleteGroupError:A error occurred while deleting group.`,
          { severity: 'danger' }
        )
      }
    }
    catch {
      console.log('deletion canceled')
    }
  }

}
