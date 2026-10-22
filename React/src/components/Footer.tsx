export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-8 px-4 text-xs text-slate-500 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300">FIRMEZA E-Commerce</span>
          <span>•</span>
          <span>Catálogo conectado a ASP.NET Core y PostgreSQL</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <a 
            href="http://localhost:4200" 
            target="_blank" 
            rel="noreferrer"
            className="text-amber-400 hover:underline font-semibold"
          >
            Acceso Empresas / Empleados (Panel Angular)
          </a>
          <span>•</span>
          <span>Sincronización en Tiempo Real</span>
        </div>
      </div>
    </footer>
  );
}
