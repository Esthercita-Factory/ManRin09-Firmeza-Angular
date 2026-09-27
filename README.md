# Firmeza — Enterprise Inventory Management

Sistema integral diseñado para el control de inventarios de alta densidad, trazabilidad inalterable de SKU y analítica logística en tiempo real. La arquitectura del sistema desacopla por completo la interfaz de usuario en un cliente web reactivo desarrollado con **Angular**, de un backend robusto y concurrente construido en **.NET Core**, respaldado por **PostgreSQL** para la persistencia relacional.

---

## 🏗 Arquitectura del Repositorio

El proyecto se estructura bajo un esquema monorepo modular:

```text
.
├── API/
│   └── Firmeza/       # Backend en .NET Core (Web API, controladores, autenticación y EF Core)
├── client/            # Frontend en Angular (Standalone Components, RxJS, HttpClient)
├── .gitignore         # Exclusión de binarios, dependencias y carpetas de entorno
└── README.md          # Documentación técnica general
🚀 Stack TecnológicoFrontend (client/)Framework: Angular (Arquitectura orientada a componentes independientes — Standalone Components)Lenguaje: TypeScriptManejo de Estado y Peticiones: RxJS y HttpClient con el patrón funcional inject()Estilizado: CSS3 estructurado y encapsulado por componenteBackend (API/Firmeza/)Plataforma: .NET Core Web APILenguaje: C#ORM: Entity Framework CoreBase de Datos: PostgreSQLSeguridad: Cifrado TLS 1.3, hashing de credenciales y autenticación mediante JWT📁 Distribución del Cliente Web (client/src/app/)Views/: Módulos y vistas principales:Home/Home.Component.ts: Landing page con telemetría en vivo, visualización de métricas y presentación de infraestructura.Auth/:Login.Component.ts: Terminal de acceso con validación de credenciales corporativas y selección de nodos de distribución.Register.Component.ts: Formulario para el alta de nuevas organizaciones empresariales, registros fiscales y configuración operativa.Dashboard/: Consola operativa para supervisión de racks, bahías y existencias críticas.Services/:Api.Service.ts: Capa de abstracción HTTP para el consumo de endpoints hacia http://localhost:5235/api/auth.router/ & app.routes.ts: Definición centralizada del sistema de rutas para navegación SPA.⚙️ Configuración y Ejecución LocalPrerrequisitos.NET SDKNode.js & npmAngular CLI (npm install -g @angular/cli)Instancia en ejecución de PostgreSQL (puerto 5432)1. Puesta en Marcha del Backend (.NET)Dirígete a la carpeta del backend:Bashcd API/Firmeza
Configura los parámetros de acceso a PostgreSQL en el archivo appsettings.json:JSON"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=firmeza_db;Username=postgres;Password=tu_contraseña"
}
Aplica las migraciones del modelo de datos:Bashdotnet ef database update
Inicia la API:Bashdotnet run
El servidor quedará a la escucha en el puerto http://localhost:5235.2. Puesta en Marcha del Frontend (Angular)Abre una terminal y sitúate en el directorio cliente:Bashcd client
Instala las dependencias del proyecto:Bashnpm install
Levanta el servidor de desarrollo local:Bashng serve
Ingresa desde el navegador a:Plaintexthttp://localhost:4200
🔒 Endpoints de Autenticación (/api/auth)VerboRutaEntradaSalida esperadaPropósitoPOST/api/auth/logincredentials: { email, password }Token JWT / Mensaje de sesiónValidación de operadores y asignación de credencialesPOST/api/auth/registeruserData: { name, email, password }Confirmación de registroAlta de organizaciones y cuentas corporativasGET/api/auth/home-dataNingunaMétricas y telemetría de loteCarga de indicadores operacionales para la vista principal
<FollowUp label="¿Quieres que añadamos los comandos para crear el archivo README.md directam
