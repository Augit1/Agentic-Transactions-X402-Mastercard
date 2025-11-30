import React, { useState } from 'react';

// --- SVG Icons de Ejemplo (Reemplaza [in], [Git], [X] si tienes SVGs o imágenes) ---
type SocialIconProps = {
    label: string;
    content: React.ReactNode;
    href?: string;
};
const SocialIcon = ({ label, content, href }: SocialIconProps) => (
    <a 
        href={href || ''} 
        aria-label={label} 
        className="text-gray-400 hover:text-blue-500 transition"
        onClick={(e) => !href && e.preventDefault()} // Evito navegación si no hay URL
    >
        {content}
    </a>
);


export default function Footer() {
    // 1. Estado para el manejo de la suscripción
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle', 'success', 'error'
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Si el email está vacío, muestra error.
        if (!email) {
            setStatus('error');
            setMessage('Por favor, ingresa una dirección de email válida.');
            return;
        }

        setStatus('success');
        setMessage('¡Gracias por suscribirte a nuestra newsletter! Si esto sale a flote, recibirás notificaciones.');
        setEmail('');
        
        setTimeout(() => setStatus('idle'), 5000); 
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (status !== 'idle') {
            setStatus('idle'); // Borra el estado si el usuario empieza a escribir de nuevo
        }
    };


    return (
        <footer className="bg-gray-900 text-white pt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Sección Principal (Grid de 4 Columnas) */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 pb-10 border-b border-gray-700">
                    
                    {/* Columna 1: Logo e Identidad */}
                    <div>
                        <h3 className="text-2xl font-bold text-white">Master<span className="text-indigo-400">Devs</span></h3>
                        <p className="mt-2 text-sm text-gray-400">
                            Solving Mastercard challenges since 25 hours
                        </p>
                        <div className="mt-4 flex space-x-4">
                            <SocialIcon label="LinkedIn" content="[in]" href="https://linkedin.com/tuperfil" />
                            <SocialIcon label="GitHub" content="[Git]" href="https://github.com/turepo" />
                            <SocialIcon label="Twitter" content="[X]" href="https://twitter.com/tuusuario" />
                        </div>
                    </div>
                    
                    {/* Columna 2: Navegación Rápida */}{/* No hay ningún link JSJJS */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Navegación</h3>
                        <ul className="space-y-3">
                            <li><a href="" className="text-gray-400 hover:text-white transition">Servicios</a></li>
                            <li><a href="" className="text-gray-400 hover:text-white transition">Equipo</a></li>
                            <li><a href="" className="text-gray-400 hover:text-white transition">Blog</a></li>
                            <li><a href="" className="text-gray-400 hover:text-white transition">Contacto</a></li>
                        </ul>
                    </div>

                    {/* Columna 3: Recursos y Legal */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Recursos</h3>
                        <ul className="space-y-3">
                            <li><a href="" className="text-gray-400 hover:text-white transition">FAQs</a></li>
                            <li><a href="" className="text-gray-400 hover:text-white transition">Términos de Uso</a></li>
                            <li><a href="" className="text-gray-400 hover:text-white transition">Política de Privacidad</a></li>
                        </ul>
                    </div>
                    
                    {/* Columna 4: Newsletter (Actualizada) */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Mantente Actualizado</h3>
                        <p className="text-sm text-gray-400 mb-3">Recibe nuestros últimos artículos y análisis.</p>
                        
                        {status === 'success' ? (
                            <div className="bg-green-700 p-4 rounded-md">
                                <p className="font-medium text-sm">{message}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <input 
                                    type="email" 
                                    placeholder="Tu email" 
                                    value={email}
                                    onChange={handleEmailChange}
                                    className={`w-full p-2 rounded-md bg-gray-700 border text-white placeholder-gray-400 mb-3 focus:ring-blue-500 focus:border-blue-500 
                                                ${status === 'error' ? 'border-red-500' : 'border-gray-600'}`}
                                />
                                <button 
                                    type="submit" 
                                    className="w-full p-2 rounded-md bg-blue-600 hover:bg-blue-700 transition font-medium"
                                >
                                    Suscribirse
                                </button>
                                {status === 'error' && (
                                    <p className="text-red-400 text-xs mt-1">{message}</p>
                                )}
                            </form>
                        )}
                    </div>
                </div>

                {/* Sección de Copyright*/}
                <div className="py-6 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} MasterDevs. Todos los derechos reservados.

                    {/* Pov: Programadores recordando que tenemos libre albedrío, XDDDDDDDDDDDDDDDDDDDD*/}
                    <p className="text-[10px] text-gray-700 mt-1">
                        (Mentira, esto no tiene base de datos, no recibirás ningún email :D. Pero se ve profesional).
                    </p>
                </div>
            </div>
        </footer>
    );
}