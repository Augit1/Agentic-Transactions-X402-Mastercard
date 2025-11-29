import React from 'react';
import AgentDashboard from './components/ui/AgentDashboard.tsx';
import Hero from './Hero.tsx';

/**
 * Componente principal de la aplicación.
 * Solo se encarga de montar el dashboard que está en la carpetita components/ui.
 */
const App: React.FC = () => {
  return (
    <>
      <div className="min-h-screen bg-black"> {/* O  para un tono menos intenso */}
        <Hero />
        <AgentDashboard />
      </div>
    </>
  );
};

export default App;