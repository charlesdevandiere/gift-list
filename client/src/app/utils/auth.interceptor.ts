import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  public constructor(private authService: AuthService) { }

  public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.authService.token) {
      const authRequest = request.clone({ setHeaders: { Authorization: `Basic ${this.authService.token}` } });
      return next.handle(authRequest);
    } else {
      return next.handle(request);
    }
  }
}
