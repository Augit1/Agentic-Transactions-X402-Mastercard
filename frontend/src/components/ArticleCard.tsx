import React from 'react';
import { type Article } from '../types';
import { Lock, Unlock } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  isUnlocked: boolean;
  onClick: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, isUnlocked, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-md border border-gray-200 transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
            isUnlocked 
              ? 'bg-green-500/90 text-white' 
              : 'bg-black/60 text-white'
          }`}>
            {isUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            {isUnlocked ? 'Unlocked' : 'Locked'}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
             <span className="px-2 py-1 bg-[#005596]/90 text-white text-[10px] uppercase font-bold tracking-wider rounded-sm">
                 {article.category}
             </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3 font-sans border-b border-slate-100 pb-2">
          <span>{article.date}</span>
          <span>{article.author}</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-serif mb-2 leading-tight group-hover:text-[#005596] transition-colors">
          {article.title}
        </h2>
        <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed font-serif">
          {article.excerpt}
        </p>
      </div>
    </div>
  );
};

export default ArticleCard;