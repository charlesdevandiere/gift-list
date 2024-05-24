import { Routes } from '@angular/router';
import { CartPageComponent } from './components/cart-page/cart-page.component';
import { GiftPageComponent } from './components/gift-page/gift-page.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { SignInPageComponent } from './components/sign-in-page/sign-in-page.component';
import { UserPageComponent } from './components/user-page/user-page.component';
import { authGuard } from './utils/auth.guard';

export const routes: Routes = [
  { path: '', component: MainPageComponent, canActivate: [authGuard] },
  { path: 'new-user', component: UserPageComponent, canActivate: [authGuard] },
  { path: 'user/:id', component: UserPageComponent, canActivate: [authGuard] },
  { path: 'new-gift', component: GiftPageComponent, canActivate: [authGuard] },
  { path: 'gift/:id', component: GiftPageComponent, canActivate: [authGuard] },
  { path: 'cart', component: CartPageComponent, canActivate: [authGuard] },
  { path: 'import-export', loadComponent: () => import('./components/import-export-page/import-export-page.component').then(mod => mod.ImportExportPageComponent), canActivate: [authGuard] },
  { path: 'sign-in', component: SignInPageComponent }
];
