import React from 'react';

// 1. --- Interfaces de Tipado (Mantener) ---
interface TeamMember {
  id: number;
  name: string;
  role: string;
  imageUrl: string; 
  description: string;
  linkedinUrl: string; 
  githubUrl: string;
}

// 2. --- Rutas de Logos Globales (Mantener) ---
const LINKEDIN_LOGO_URL = 'https://cdn-icons-png.flaticon.com/128/145/145807.png';
const GITHUB_LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Octicons-mark-github.svg/2048px-Octicons-mark-github.svg.png';

// 3. --- Componente de la Tarjeta Individual con Animaciones ---
const TeamMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => {

  const openLink = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer'); 
    }
  };

  return (
    <div
        className="
            relative                   // Necesario para el efecto 'ring' o resplandor
            bg-gray-800 
            rounded-xl 
            shadow-lg 
            overflow-hidden 
            transform 
            transition 
            duration-150
            ease-in-out 
            hover:shadow-2xl 
            hover:shadow-blue-500
            hover:-translate-y-5
            hover:scale-[1.01]
            border border-gray-700    // Borde inicial
            text-white 
            flex flex-col 
            h-full
        "
    >
        
      {/* 4. Contenedor de Imagen: Agrega un efecto de zoom */}
      <div className="w-full h-64 overflow-hidden bg-gray-700">
        <img
          className="
            w-full h-full object-cover object-center 
            transform transition duration-500 ease-in-out
            hover:scale-[1.05] 
            hover:opacity-90
          " 
          src={member.imageUrl}
          alt={`Foto de ${member.name}`}
        />
      </div>
      
      {/* Sección de Contenido Inferior */}
      <div className="p-6 flex flex-col grow">
        
        {/* Nombre y Rol */}
        <h3 className="text-xl font-semibold mb-1">
          {member.name}
        </h3>
        <p className="text-sm text-blue-400 mb-4 transition duration-300 ease-in-out group-hover:text-blue-300">
          {member.role}
        </p>
        
        {/* Descripción */}
        <p className="text-gray-300 text-base mb-6 grow">
          {member.description}
        </p>

        {/* 5. Social Media (icons): Animación en los iconos */}
        <div className="flex space-x-4 mt-auto">
          {member.linkedinUrl && (
            <button
              onClick={() => openLink(member.linkedinUrl)}
              className="
                p-2 rounded-full transform transition duration-200 
                hover:bg-blue-600/20 hover:scale-110                  // Fondo y escala al hover
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              "
              aria-label={`Perfil de LinkedIn de ${member.name}`}
            >
              <img src={LINKEDIN_LOGO_URL} alt="LinkedIn" className="h-10 w-10" />
            </button>
          )}

          {member.githubUrl && (
            <button
              onClick={() => openLink(member.githubUrl)}
              className="
                p-2 rounded-full transform transition duration-200 
                hover:bg-gray-600/20 hover:scale-110                  // Fondo y escala al hover
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
              "
              aria-label={`Perfil de GitHub de ${member.name}`}
            >
              <img src={GITHUB_LOGO_URL} alt="GitHub" className="h-10 w-10 invert" /> 
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


// 4. --- Datos de Ejemplo del Equipo ---
const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Augustin Bethery de La Brosse ',
    role: 'Fullstack Developer',
    imageUrl: '/images/Agustin.jpeg',
    description: 'Descripcion :D',
    linkedinUrl: 'https://www.linkedin.com/in/augustin-bethery/',
    githubUrl: 'https://github.com/Augit1',
  },
  {
    id: 2,
    name: 'Alex Michael Espinosa Males',
    role: 'Fullstack Developer',
    imageUrl: '/images/michael.jpg',
    description: 'Ingeniero de Software',
    linkedinUrl: 'https://www.linkedin.com/in/michael-espinosa/',
    githubUrl: 'https://github.com/blex-ing',
  },
  {
    id: 3,
    name: 'Fabricio López Reyes',
    role: 'Fullstack Developer, Business',
    imageUrl: '/images/Fabricio.png',
    description: 'Descripcion :D',
    linkedinUrl: 'https://www.linkedin.com/in/fabricio-l%C3%B3pez-reyes/',
    githubUrl: 'https://github.com/sherlockpe',
  },
  {
    id: 4,
    name: 'Sam Cowan',
    role: 'Fullstack Developer, Data Scientist',
    imageUrl: '/images/Sam.jpeg',
    description: 'Descripcion :D',
    linkedinUrl: 'https://www.linkedin.com/in/sam-t-cowan/',
    githubUrl: 'https://github.com/samc5',
  },
];


// 5. --- Componente Contenedor Principal (Exportado) ---
export default function TeamSection() {
  return (
    <section className="py-20 bg-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        {/* Título */}
        <h2 className="text-4xl font-light text-white text-center mb-32">
          <span className=" italic text-shadow-white text-5xl ">Meet our Team </span>
        </h2>
        
        {/* Contenedor de Grid de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}