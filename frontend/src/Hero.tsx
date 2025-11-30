// Hero.tsx

import React from 'react';
import Aurora from './components/ui/Aurora';
import {FadeInUp} from './components/ui/TextAnimations.tsx'

// 1. Definir el tipo de las props
interface HeroProps {
  onStartDemoClick: () => void; // Función sin argumentos que inicia el desplazamiento
}

// 2. Recibir la prop en el componente
const Hero: React.FC<HeroProps> = ({ onStartDemoClick }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center py-20 bg-black"> 
      {/* Contenedor de Aurora */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
        <Aurora 
          colorStops={["#FE67C7", "#584790", "#5F4EB1"]}
          blend={1}
          amplitude={1.0}
          speed={1}
        />
      </div>
      
      <div className="text-center px-4 sm:px-6 lg:px-7 relative z-10"> 
        {/* Título principal */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold bg-clip-text text-white mb-6">
          <FadeInUp>Masterdevs</FadeInUp>
        </h1>
        
        {/* Subtítulo */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8">
            Agency Transactions
        </h2>
        
        {/* Descripción */}
        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Experience the future of autonomous payments with agents using X402, Mastercard, and BSV. 
        </p>
        
        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
              // 3. Asignar la función a onClick del botón
              onClick={onStartDemoClick} 
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105 transform">
              Start Demo
          </button>
          
          <button className="px-8 py-4 bg-transparent border-2 border-white/30 hover:border-white/50 text-white font-semibold rounded-xl transition-all duration-200 hover:bg-white/10">
              About
          </button>
        </div>
        
        {/* Tecnologías */}
        <div className="mt-16 flex flex-wrap justify-center gap-4">
          <span className="px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full text-blue-300 font-medium">
            X402 Protocol
          </span>
          <span className="px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full text-purple-300 font-medium">
            Mastercard Integration
          </span>
          <span className="px-4 py-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full text-emerald-300 font-medium">
            BSV Blockchain
          </span>
        </div>
      </div>
    </div>
  );
};

export default Hero;