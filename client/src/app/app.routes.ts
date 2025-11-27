import { Routes } from '@angular/router'
import { CartPageComponent } from './pages/cart-page/cart-page.component'
import { GiftPageComponent } from './pages/gift-page/gift-page.component'
import { ImportPageComponent } from './pages/import-page/import-page.component'
import { MainPageComponent } from './pages/main-page/main-page.component'
import { SignInPageComponent } from './pages/sign-in-page/sign-in-page.component'
import { UserPageComponent } from './pages/user-page/user-page.component'
import { authGuard } from './utils/auth.guard'

export const routes: Routes = [
  { path: '', component: MainPageComponent, canActivate: [authGuard] },
  { path: 'new-user', component: UserPageComponent, canActivate: [authGuard] },
  { path: 'user/:id', component: UserPageComponent, canActivate: [authGuard] },
  { path: 'new-gift', component: GiftPageComponent, canActivate: [authGuard] },
  { path: 'gift/:id', component: GiftPageComponent, canActivate: [authGuard] },
  { path: 'cart', component: CartPageComponent, canActivate: [authGuard] },
  { path: 'import', component: ImportPageComponent, canActivate: [authGuard] },
  { path: 'sign-in', component: SignInPageComponent }
]
