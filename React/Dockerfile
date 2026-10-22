# Servidor Nginx para E-commerce React
FROM nginx:alpine

# Configuración personalizada de Nginx para SPA (Single Page Application)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el bundle de producción compilado de React
COPY dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
