import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest
} from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { Observable } from 'rxjs'
import { AuthService } from '../services/auth.service'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService)

  public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token: string | null = this.authService.token()
    if (token) {
      const authRequest = request.clone({ setHeaders: { Authorization: `Basic ${token}` } })
      return next.handle(authRequest)
    } else {
      return next.handle(request)
    }
  }
}
