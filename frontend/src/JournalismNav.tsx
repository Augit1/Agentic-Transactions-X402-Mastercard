import { Settings, LayoutGrid } from 'lucide-react'; // ⬅️ Solo importamos los íconos necesarios aquí

// Definición de las props que el componente necesita para funcionar
interface JournalismNavProps {
  /** Función para navegar de vuelta a la vista de lista. */
  onGoHome: () => void;
  /** El estado actual para abrir/cerrar el SettingsDrawer. */
  isSettingsOpen: boolean;
  /** Función para alternar el estado de isSettingsOpen. */
  onToggleSettings: () => void;
}

/**
 * Componente de la barra de navegación para la aplicación Journalism.
 * Contiene el logo, el título y el botón para abrir la configuración.
 */
export default function JournalismNav({
  onGoHome,
  isSettingsOpen,
  onToggleSettings,
}: JournalismNavProps) {
  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo y Título */}
          <div className="flex items-center cursor-pointer" onClick={onGoHome}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-indigo-500/30 shadow-lg">
              <LayoutGrid className="text-white w-5 h-5" />
            </div>
            <span className="font-serif font-bold text-xl tracking-tight">
              Micro<span className="text-indigo-600">News</span>
            </span>
          </div>

          {/* Botón de Configuración */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSettings}
              className={`p-2 rounded-lg transition-colors ${
                isSettingsOpen
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}