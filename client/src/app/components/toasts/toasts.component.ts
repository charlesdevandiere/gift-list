import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Toast } from '../../models/toast.model';
import { ToastsService } from '../../services/toasts.service';

@Component({
  selector: 'app-toasts',
  templateUrl: './toasts.component.html',
  styleUrls: ['./toasts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, AsyncPipe]
})
export class ToastsComponent {
  protected readonly toasts$: Observable<Toast[]>;

  public constructor(private readonly toastsService: ToastsService) {
    this.toasts$ = this.toastsService.toasts$;
  }

  protected close(toastId: number): void {
    this.toastsService.hide(toastId);
  }

}
