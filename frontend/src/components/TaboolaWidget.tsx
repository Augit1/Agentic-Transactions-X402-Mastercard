import React from 'react';

const AD_CONTENT = [
  { img: 'https://picsum.photos/300/200?random=100', title: 'Homeowners Are Trading in Their Roofs for This' },
  { img: 'https://picsum.photos/300/200?random=101', title: 'The 10 Most Beautiful Islands in the World' },
  { img: 'https://picsum.photos/300/200?random=102', title: 'If You Have 20/20 Vision, Find the Cat in This Photo' },
  { img: 'https://picsum.photos/300/200?random=103', title: 'Celebrities Who Look Completely Different Now' },
  { img: 'https://picsum.photos/300/200?random=104', title: 'Try This Simple Trick to Save on Electric Bill' },
  { img: 'https://picsum.photos/300/200?random=105', title: 'Doctors Are Stunned: This Fruit Burns Fat Overnight' },
];

interface TaboolaWidgetProps {
    variant?: 'footer' | 'inline';
}

const TaboolaWidget: React.FC<TaboolaWidgetProps> = ({ variant = 'footer' }) => {
  // For inline, we just take a slice to show 3 items, for footer we show all 6
  const displayAds = variant === 'inline' ? AD_CONTENT.slice(0, 3) : AD_CONTENT;

  return (
    <div className={`
      ${variant === 'footer' ? 'mt-16 border-t-4 border-slate-100 dark:border-slate-800 pt-8' : 'my-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800'}
    `}>
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-bold text-slate-500 dark:text-slate-400 text-xs font-sans uppercase tracking-widest">
            {variant === 'inline' ? 'Suggested For You' : 'Sponsored Content'}
        </h3>
        <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Ads by Taboola</span>
      </div>
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${variant === 'footer' ? 'md:grid-cols-3' : 'md:grid-cols-3'} gap-x-4 gap-y-6 px-2`}>
        {displayAds.map((ad, i) => (
          <div key={i} className="group cursor-pointer flex flex-col h-full">
            <div className="overflow-hidden rounded-md mb-2 aspect-4/3">
              <img 
                src={`${ad.img}&v=${variant}-${i}`} // Force unique image per instance slightly if random param worked that way, but keeps it consistent
                alt="Ad" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out" 
              />
            </div>
            <h4 className="font-medium text-sm text-slate-800 dark:text-slate-200 leading-snug group-hover:underline group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {ad.title}
            </h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaboolaWidget;