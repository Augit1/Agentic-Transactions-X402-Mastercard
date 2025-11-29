import React from 'react';
import AgentDashboard from './components/ui/AgentDashboard.tsx';

/**
 * Componente principal de la aplicación.
 * Solo se encarga de montar el dashboard que está en la carpetita components/ui.
 */
const App: React.FC = () => {
  return (
    // Renderiza el dashboard
    <AgentDashboard />
  );
};

export default App;