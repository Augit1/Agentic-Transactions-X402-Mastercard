import React from 'react';
import { X } from 'lucide-react';

const VIDEO_SOURCES = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", 
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", // This one will be obnoxious
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
];

const POSITIONS = [
  "top-32 left-4",           // Top Left
  "top-48 right-4",          // Top Right
  "bottom-24 left-8",        // Bottom Left - Obnoxious one
  "bottom-40 right-2",       // Bottom Right
  "top-1/2 -translate-y-1/2 left-0", // Middle Left
  "top-1/2 -translate-y-1/2 right-0" // Middle Right
];

const AnnoyingVideoAds: React.FC = () => {
  return (
    <>
      <style>
        {`
          @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
          }
          .obnoxious-shake {
            animation: shake 0.5s;
            animation-iteration-count: infinite;
          }
        `}
      </style>
      {POSITIONS.map((positionClass, index) => {
        const isObnoxious = index === 2; // The 3rd video is the obnoxious one

        return (
          <div
            key={index}
            className={`fixed z-30 transition-opacity duration-150 ease-out hover:opacity-0 hover:pointer-events-none ${positionClass} 
              ${isObnoxious 
                ? 'w-72 h-48 border-4 border-yellow-400 obnoxious-shake shadow-[0_0_15px_5px_rgba(255,255,0,0.7)]' 
                : 'w-48 h-32 md:w-64 md:h-40 border-2 border-red-500 shadow-2xl'
              } 
              bg-black rounded-lg overflow-hidden`}
          >
            {/* Fake Header with Close Button */}
            <div className={`absolute top-0 left-0 right-0 text-[10px] font-bold px-2 py-1 flex justify-between items-center z-10 ${
                isObnoxious ? 'bg-yellow-400 text-black animate-pulse' : 'bg-red-600 text-white'
            }`}>
              <span>{isObnoxious ? '⚠️ URGENT ALERT' : 'SPONSORED VIDEO'}</span>
              <X className="w-3 h-3 cursor-pointer" />
            </div>
            
            {/* Video Player */}
            <video
              src={VIDEO_SOURCES[index]}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover mt-4" 
            />
          </div>
        );
      })}
    </>
  );
};

export default AnnoyingVideoAds;