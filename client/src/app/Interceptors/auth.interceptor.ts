import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../Services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let clonedReq = req;
  if (token && req.url.includes('/api/')) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginRequest = req.url.toLowerCase().includes('login');

      // Si al iniciar sesión responde 401 (No autorizado) o usuario inexistente / credenciales inválidas (404 / 400)
      if (isLoginRequest && (error.status === 401 || error.status === 404 || error.status === 400)) {
        const customMessage = 'Los datos son invalidos';
        const customError = new HttpErrorResponse({
          error: { message: customMessage, error: customMessage },
          status: error.status,
          statusText: 'Unauthorized',
          headers: error.headers,
          url: error.url ?? undefined
        });

        return throwError(() => customError);
      }

      // Manejo general de 401 en autenticación
      if (error.status === 401 && (isLoginRequest || req.url.toLowerCase().includes('/auth'))) {
        const customMessage = 'Los datos son invalidos';
        const customError = new HttpErrorResponse({
          error: { message: customMessage, error: customMessage },
          status: 401,
          statusText: 'Unauthorized',
          headers: error.headers,
          url: error.url ?? undefined
        });

        return throwError(() => customError);
      }

      return throwError(() => error);
    })
  );
};
