import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Gift } from 'src/app/models/gift.model';
import { AuthService } from 'src/app/services/auth.service';
import { GiftsService } from 'src/app/services/gifts.service';
import { ToastsService } from 'src/app/services/toasts.service';
import { AppTranslations } from 'src/app/utils/app-translations';

@Component({
  selector: 'app-gift-page',
  templateUrl: './gift-page.component.html',
  styleUrls: ['./gift-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class GiftPageComponent implements OnInit {

  protected action: 'add' | 'update' = 'add';

  protected readonly form: FormGroup<{
    id: FormControl<string | null>,
    name: FormControl<string | null>,
    link1: FormControl<string | null>,
    link2: FormControl<string | null>,
    link3: FormControl<string | null>
  }>;

  public giftId: string | null = this.route.snapshot.paramMap.get('id');

  public constructor(
    formBuilder: FormBuilder,
    public translations: AppTranslations,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private giftsService: GiftsService,
    private toastsService: ToastsService) {
    this.form = formBuilder.group({
      id: [null as string | null],
      name: [null as string | null, [Validators.required, Validators.maxLength(250)]],
      link1: [null as string | null, [Validators.maxLength(2000)]],
      link2: [null as string | null, [Validators.maxLength(2000)]],
      link3: [null as string | null, [Validators.maxLength(2000)]]
    });
  }

  public ngOnInit(): void {
    if (this.giftId) {
      this.prepareForUpdate(this.giftId);
    } else {
      this.prepareForAdd();
    }
  }

  protected async back(): Promise<void> {
    await this.router.navigate(
      ['/'],
      { queryParams: { 'user-id': this.authService.userId } }
    );
  }

  public async onSubmit(): Promise<void> {
    try {
      if (this.action === 'add' && this.form.value.name) {
        await firstValueFrom(this.giftsService
          .addGift({
            name: this.form.value.name,
            link1: this.form.value.link1,
            link2: this.form.value.link2,
            link3: this.form.value.link3
          })
        );
        this.toastsService.show(this.translations.gift.giftAddedMessage, { severity: 'success' });
        await this.back();
      } else if (this.action === 'update' && this.form.value.id && this.form.value.name) {
        await firstValueFrom(this.giftsService
          .updateGift({
            id: this.form.value.id,
            name: this.form.value.name,
            link1: this.form.value.link1,
            link2: this.form.value.link2,
            link3: this.form.value.link3
          })
        );
        this.toastsService.show(this.translations.gift.giftUpdatedMessage, { severity: 'success' });
        await this.back();
      }
    }
    catch (err) {
      console.error(err);
      this.toastsService.show(this.translations.misc.error, { severity: 'danger' });
    }
  }

  private prepareForAdd(): void {
    this.action = 'add';
  }

  private prepareForUpdate(giftId: string): void {
    this.action = 'update';
    this.giftsService.getGift(giftId)
      .subscribe((gift: Gift): void => {
        this.form.reset({
          id: giftId,
          name: gift.name,
          link1: gift.link1,
          link2: gift.link2,
          link3: gift.link3
        });
        this.form.updateValueAndValidity();
      });
  }

}
