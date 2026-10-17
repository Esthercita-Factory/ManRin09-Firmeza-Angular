import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

/**
 * Interceptor HTTP dedicado para la gestión y validación de Productos.
 * Captura errores 400 (Bad Request - campos faltantes o restricciones de DTO)
 * y 401 (Unauthorized - token JWT ausente, inválido o expirado).
 * Muestra una alerta interactiva con SweetAlert2 usando el signo de exclamación (!)
 * y propaga el mensaje formateado hacia el formulario.
 */
export const productInterceptor: HttpInterceptorFn = (req, next) => {
  const isProductApi = req.url.toLowerCase().includes('/api/products');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Interceptar únicamente peticiones dirigidas al módulo de productos
      if (isProductApi && (error.status === 400 || error.status === 401)) {
        let title = 'Atención en Producto';
        let formattedMessage = '';

        if (error.status === 400) {
          title = 'Inconsistencia en Datos del Producto';

          // 1. Manejo de errores de validación de modelo ASP.NET Core (ProblemDetails con diccionario de 'errors')
          if (error.error?.errors && typeof error.error.errors === 'object') {
            const errorList: string[] = [];
            for (const key of Object.keys(error.error.errors)) {
              const val = error.error.errors[key];
              if (Array.isArray(val)) {
                errorList.push(...val);
              } else if (typeof val === 'string') {
                errorList.push(val);
              }
            }

            if (errorList.length > 0) {
              formattedMessage = `
                <div style="text-align: left; font-size: 0.88rem; line-height: 1.5; color: #334155;">
                  <p style="margin: 0 0 8px 0; font-weight: 600; color: #b91c1c;">
                    El servidor rechazó la solicitud debido a las siguientes restricciones del DTO:
                  </p>
                  <ul style="margin: 0; padding-left: 18px; color: #dc2626;">
                    ${errorList.map(msg => `<li style="margin-bottom: 4px;">${msg}</li>`).join('')}
                  </ul>
                </div>
              `;
            }
          }

          // 2. Si no vino el diccionario 'errors', buscar propiedad 'message' o 'title'
          if (!formattedMessage) {
            const serverMsg =
              error.error?.message ||
              (typeof error.error === 'string' && error.error.trim().length > 0 ? error.error.trim() : null) ||
              error.error?.title;

            if (serverMsg) {
              formattedMessage = `
                <div style="text-align: left; font-size: 0.9rem; color: #334155;">
                  <p style="margin: 0 0 6px 0; font-weight: 600; color: #b91c1c;">Error de validación:</p>
                  <p style="margin: 0;">${serverMsg}</p>
                </div>
              `;
            } else {
              formattedMessage = 'Faltan campos obligatorios o algunos valores superan la longitud máxima permitida.';
            }
          }
        } else if (error.status === 401) {
          title = 'No Autorizado (JWT)';
          const serverMsg =
            error.error?.message ||
            (typeof error.error === 'string' && error.error.trim().length > 0 ? error.error.trim() : null);

          formattedMessage = serverMsg || 'No fue posible validar la identidad o sesión del usuario a partir del token JWT. Inicie sesión nuevamente para registrar inventario.';
        }

        // Mostrar alerta modal interactiva de SweetAlert2 con signo de exclamación (!)
        Swal.fire({
          icon: 'warning', // Renderiza el icono con signo de exclamación (!)
          title: title,
          html: formattedMessage,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#2563eb',
          customClass: {
            popup: 'fz-swal-warning-popup'
          }
        });

        // Crear HttpErrorResponse con el mensaje enriquecido para que el formulario lo reciba
        const plainText = formattedMessage.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const customError = new HttpErrorResponse({
          error: {
            ...((typeof error.error === 'object' && error.error) ? error.error : {}),
            message: plainText,
            htmlMessage: formattedMessage,
            handledByProductInterceptor: true
          },
          status: error.status,
          statusText: error.statusText,
          headers: error.headers,
          url: error.url ?? undefined
        });

        return throwError(() => customError);
      }

      return throwError(() => error);
    })
  );
};
