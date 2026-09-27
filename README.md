# Firmeza — Enterprise Inventory Management

[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![.NET Core](https://img.shields.io/badge/.NET_Core-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white)](https://learn.microsoft.com/dotnet/csharp/)

Sistema industrial de control de inventarios, trazabilidad de SKUs y telemetría logística. Arquitectura desacoplada basada en un frontend reactivo con **Angular Standalone Components** y un backend concurrente en **.NET Core Web API**, persistido sobre **PostgreSQL**.

---

## 🏗 Arquitectura del Monorepo

```text
Firmeza/
├── API/
│   └── Firmeza/                    # Backend en .NET Core Web API
│       ├── Controllers/            # Controladores REST (Auth, Home, Stock)
│       ├── Models/                 # Entidades y DTOs de dominio
│       ├── Data/                   # Contexto de Entity Framework Core
│       └── appsettings.json        # Cadenas de conexión y configuración
├── client/                         # Frontend en Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── Components/         # Componentes UI reutilizables
│   │   │   ├── Services/           # Servicios HTTP (Api.Service.ts)
│   │   │   ├── Views/              # Vistas principales
│   │   │   │   ├── Auth/           # Login.Component.ts, Register.Component.ts
│   │   │   │   ├── Dashboard/      # Consola operativa de almacenes
│   │   │   │   └── Home/           # Home.Component.ts (Landing & telemetría)
│   │   │   ├── router/             # Módulos y configuración de rutas
│   │   │   ├── app.routes.ts       # Definición de rutas principales
│   │   │   └── app.config.ts       # Proveedores globales (provideHttpClient)
│   │   └── main.ts                 # Bootstrap de la aplicación Angular
└── README.md
```

---

## 🚀 Stack Tecnológico

### Frontend
- **Framework:** Angular (Standalone Components)
- **Lenguaje:** TypeScript
- **Consumo HTTP:** `HttpClient` con patrón `inject()` y programación reactiva mediante `RxJS`
- **Estilos:** CSS3 nativo encapsulado con paleta industrial

### Backend
- **Framework:** .NET Core Web API
- **Lenguaje:** C#
- **ORM:** Entity Framework Core
- **Base de Datos:** PostgreSQL
- **Seguridad:** Cifrado TLS 1.3, autenticación con JWT / Identity

---

## ⚙️ Puesta en Marcha en Local

### Prerrequisitos
- [.NET SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (versión LTS recomendada)
- [Angular CLI](https://angular.dev/) (`npm install -g @angular/cli`)
- [PostgreSQL](https://www.postgresql.org/) en ejecución en el puerto `5432` (nativo o contenedor Docker)

---

### 1. Configurar y Levantar el Backend (.NET)

1. Ingresar al directorio del backend:
   ```bash
   cd API/Firmeza
   ```

2. Configurar la cadena de conexión en `appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=firmeza_db;Username=postgres;Password=tu_contraseña"
   }
   ```

3. Aplicar las migraciones a la base de datos:
   ```bash
   dotnet ef database update
   ```

4. Ejecutar la API:
   ```bash
   dotnet run
   ```
   *El servidor quedará disponible por defecto en:* `http://localhost:5235`

---

### 2. Configurar y Levantar el Frontend (Angular)

1. Abrir otra terminal e ingresar a la carpeta del cliente:
   ```bash
   cd client
   ```

2. Instalar las dependencias de Node:
   ```bash
   npm install
   ```

3. Levantar el servidor de desarrollo:
   ```bash
   ng serve
   ```

4. Abrir la aplicación en el navegador:
   ```text
   http://localhost:4200
   ```

---

## 🔒 Especificación de Endpoints (`/api/auth`)

| Método | Endpoint | Payload / Parámetros | Respuesta esperada | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | `{ "email": "...", "password": "..." }` | `200 OK` (Token / Mensaje) | Valida credenciales corporativas de operadores |
| `POST` | `/api/auth/register` | `{ "name": "...", "email": "...", "password": "..." }` | `201 Created` / `200 OK` | Registra nuevas organizaciones y accesos |
| `GET` | `/api/auth/home-data` | *Ninguno* | `200 OK` (JSON telemetría) | Retorna datos e indicadores para la vista Home |

---

## 📄 Licencia

Distribuido bajo licencia propietaria para el ecosistema **Firmeza Technologies Inc.** Todos los derechos reservados.
