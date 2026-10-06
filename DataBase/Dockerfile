FROM postgres:16-alpine
ENV POSTGRES_DB=FirmezaDb
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgrespassword
COPY ./Schema.sql /docker-entrypoint-initdb.d/Schema.sql
EXPOSE 5432

