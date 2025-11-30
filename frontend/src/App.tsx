// App.tsx
import React from 'react';
// Asegúrate de que estos componentes acepten la prop 'id'
import AgentDashboard from './components/ui/AgentDashboard.tsx';
import Hero from './Hero.tsx'; // Importación
import Journalism from './Journalism.tsx';
import Team from './Team.tsx'
import Footer from './Footer.tsx';

// Definir el tipo para la prop de desplazamiento que pasaremos
type ScrollHandler = (targetId: string) => void; 

// 1. Modificar Navigation para que reciba la función de desplazamiento
// Ahora acepta la prop 'onScrollTo'
const Navigation: React.FC<{ onScrollTo: ScrollHandler }> = ({ onScrollTo }) => {
  // Navigation ya no necesita definir handleScroll, ahora usa onScrollTo
  const navItems = [
    {name: 'Home', id: 'hero' },
    {name: 'Dashboard', id: 'dashboard' }, 
    {name: 'Use Case', id: 'journal' },
    {name: 'Our Team', id: 'team'}
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
                onClick={() => onScrollTo(item.id)}
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


// Componente principal de la aplicación.
const App: React.FC = () => {
  /**
   * Mover handleScroll aquí para que sea accesible para los hijos (Navigation y Hero)
   * @param targetId El ID del elemento al que se quiere desplazar (ej. 'hero', 'dashboard').
   */
  const handleScroll: ScrollHandler = (targetId) => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth' // Habilita el desplazamiento suave
      });
    }
  };


  return (
    <>
      {/* 3. Pasar la función a Navigation */}
      <Navigation onScrollTo={handleScroll} />
      <div className="min-h-screen bg-black">
        <div id="hero">
          {/* 4. Pasar la función a Hero como prop, por ejemplo, 'onStartDemoClick' */}
          <Hero onStartDemoClick={() => handleScroll('dashboard')} /> 
        </div>
          <div id= "dashboard" className='pt-35'>
          <AgentDashboard  />
        </div>
        <div id = "journal" className='pt-20'>
          <Journalism  />
        </div>
        <div id = "team" className='pt-40'>
          <Team />
        </div>
        <Footer/>
      </div>
    </>
  );
};

export default App;