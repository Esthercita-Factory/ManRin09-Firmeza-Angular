import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor HTTP dedicado para la gestión y consulta de Empleados.
 * Intercepta peticiones a /api/employees y personaliza la respuesta en caso de errores o búsquedas fallidas.
 */
export const employeeInterceptor: HttpInterceptorFn = (req, next) => {
  const isEmployeeApi = req.url.toLowerCase().includes('/api/employees');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isEmployeeApi && error.status === 404) {
        const customMessage = 'El empleado consultado no se encuentra registrado en la base de datos.';
        const customError = new HttpErrorResponse({
          error: { message: customMessage, error: customMessage },
          status: 404,
          statusText: 'Not Found',
          headers: error.headers,
          url: error.url ?? undefined
        });

        return throwError(() => customError);
      }

      return throwError(() => error);
    })
  );
};
