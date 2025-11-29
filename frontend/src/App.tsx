import React from 'react';
// Asegúrate de que estos componentes acepten la prop 'id'
import AgentDashboard from './components/ui/AgentDashboard.tsx';
import Hero from './Hero.tsx';
import Journalism from './Journalism.tsx';

// Navigation

const Navigation: React.FC = () => {
  /**
   * Maneja el evento de clic para desplazar a la sección con el ID especificado.
   * @param targetId El ID del elemento al que se quiere desplazar (ej. 'hero', 'dashboard').
   */
  const handleScroll = (targetId: string) => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth' // Habilita el desplazamiento suave
      });
    }
  };

  const navItems = [
    { name: 'Inicio', id: 'hero' },
    { name: 'Dashboard', id: 'dashboard' }, 
    { name: 'Prensa', id: 'journal' },
  ];

  return (
    // Barra de navegación fija en la parte superior, visible en todas las secciones
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo o Título de la Aplicación */}
          <div className="shrink-0">
            <span className="text-2xl font-bold text-white tracking-wider">
              Master<span className="text-indigo-400">Devs</span>
            </span>
          </div>
          
          {/* Enlaces de Navegación */}
          <nav className="flex space-x-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleScroll(item.id)}
                className=" text-gray-300  hover:bg-indigo-600  hover:text-white  px-3 py-2  rounded-xl  text-lg  font-medium  transition duration-300 ease-in-out shadow-md">
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};


//Componente principal de la aplicación.
const App: React.FC = () => {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-black">
        <div id="hero">
          <Hero /> 
        </div>
        <div id= "dashboard" className='pt-20'>
          <AgentDashboard  />
        </div>
        <div id = "journal" className='pt-20'>
          <Journalism  />
        </div>
      </div>
    </>
  );
};

export default App;