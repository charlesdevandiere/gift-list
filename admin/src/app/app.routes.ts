import { Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { NewGroupPageComponent } from './pages/new-group-page/new-group-page.component';
import { SignInPageComponent } from './pages/sign-in-page/sign-in-page.component';
import { authGuard } from './utils/auth.guard';

export const routes: Routes = [
  { path: '', component: MainPageComponent, canActivate: [authGuard] },
  { path: 'new-group', component: NewGroupPageComponent, canActivate: [authGuard] },
  { path: 'sign-in', component: SignInPageComponent }
];
