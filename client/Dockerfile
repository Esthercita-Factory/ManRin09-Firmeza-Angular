# Servidor Nginx de Producción para Angular SPA
FROM nginx:alpine

# Configuración personalizada de Nginx con soporte de SPA routing y compresión
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el bundle de producción compilado de Angular
COPY dist/client-app/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
