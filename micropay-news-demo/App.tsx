import React, { useState, useEffect } from 'react';
import { MOCK_ARTICLES, INITIAL_SETTINGS, INITIAL_WALLET } from './constants';
import { Article, UserSettings, WalletState } from './types';
import SettingsDrawer from './components/SettingsDrawer';
import ArticleCard from './components/ArticleCard';
import PaywallModal from './components/PaywallModal';
import TaboolaWidget from './components/TaboolaWidget';
import { Settings, LayoutGrid, ArrowLeft, ShieldCheck, AlertCircle, Crown } from 'lucide-react';

// Simple hook to persist state to local storage
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// Track how an article was accessed
type AccessMethod = 'paid' | 'ads' | 'subscribed';

export default function App() {
  // --- State ---
  const [settings, setSettings] = useStickyState<UserSettings>(INITIAL_SETTINGS, 'user_settings');
  const [wallet, setWallet] = useStickyState<WalletState>(INITIAL_WALLET, 'user_wallet');
  
  // Replaces simple string[] with a record of how it was accessed
  const [articleAccess, setArticleAccess] = useStickyState<Record<string, AccessMethod>>({}, 'article_access_registry');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'article'>('list');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  // --- Logic ---

  // Check if we need to reset daily spend limit
  useEffect(() => {
    const today = new Date().toDateString();
    if (settings.lastResetDate !== today) {
        setSettings(prev => ({
            ...prev,
            spentToday: 0,
            lastResetDate: today
        }));
    }
  }, [settings.lastResetDate, setSettings]);

  const activeArticle = MOCK_ARTICLES.find(a => a.id === selectedArticleId);

  const handleArticleClick = (article: Article) => {
    setSelectedArticleId(article.id);
    const hasAccess = !!articleAccess[article.id];
    
    if (hasAccess) {
      setCurrentView('article');
    } else {
      // Check for "Magic" auto-pay based on user settings
      const canAfford = wallet.balance >= article.price;
      const withinDaily = (settings.spentToday + article.price) <= settings.maxPaymentPerDay;
      const withinArticleLimit = article.price <= settings.maxPaymentPerArticle;

      if (canAfford && withinDaily && withinArticleLimit) {
        // Auto-pay logic
        executePayment(article);
      } else {
        // Trigger Paywall Modal if limit exceeded or logic requires confirmation
        setShowPaywall(true);
      }
    }
  };

  const executePayment = async (article: Article) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Deduct Balance
    setWallet(prev => ({
        ...prev,
        balance: prev.balance - article.price
    }));

    // Update Spend Tracker
    setSettings(prev => ({
        ...prev,
        spentToday: prev.spentToday + article.price
    }));

    // Unlock Content as PAID
    setArticleAccess(prev => ({ ...prev, [article.id]: 'paid' }));
    
    // Navigate
    setShowPaywall(false);
    setCurrentView('article');
  };

  const handleManualPay = async () => {
    if (!activeArticle) return;
    await executePayment(activeArticle);
  };

  const handleSubscribe = async () => {
      if (!activeArticle) return;
      // Simulate sub delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Unlock as Subscribed
      setArticleAccess(prev => ({ ...prev, [activeArticle.id]: 'subscribed' }));
      setShowPaywall(false);
      setCurrentView('article');
  };

  const handleViewWithAds = () => {
    if (!activeArticle) return;
    // Unlock Content as ADS
    setArticleAccess(prev => ({ ...prev, [activeArticle.id]: 'ads' }));
    setShowPaywall(false);
    setCurrentView('article');
  };

  const handleReset = () => {
    setWallet(INITIAL_WALLET);
    setArticleAccess({});
    // We intentionally do not reset settings (max payment preferences) as the user 
    // likely wants to keep their config, just reset the content/money simulation.
  };

  const goHome = () => {
    setCurrentView('list');
    setSelectedArticleId(null);
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-200 dark:selection:bg-indigo-900">
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            <div className="flex items-center cursor-pointer" onClick={goHome}>
               <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-indigo-500/30 shadow-lg">
                   <LayoutGrid className="text-white w-5 h-5" />
               </div>
               <span className="font-serif font-bold text-xl tracking-tight">Micro<span className="text-indigo-600">News</span></span>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-2 rounded-lg transition-colors ${isSettingsOpen ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        
        {/* Top Right Settings Drawer */}
        <SettingsDrawer 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
            settings={settings}
            wallet={wallet}
            onSaveSettings={setSettings}
            onReset={handleReset}
        />

        {currentView === 'list' && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-12 mt-4">
                <h1 className="text-4xl md:text-5xl font-serif font-black mb-4 text-slate-900 dark:text-white">
                    Journalism, Decentralized.
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Access premium content instantly. Pay per article or view with ads.
                    <br className="hidden md:block"/> No subscriptions. Your choice.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MOCK_ARTICLES.map(article => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  isUnlocked={!!articleAccess[article.id]}
                  onClick={() => handleArticleClick(article)}
                />
              ))}
            </div>
          </div>
        )}

        {currentView === 'article' && activeArticle && (
          <article className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <button 
                onClick={goHome} 
                className="group flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 mb-8 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
                Back to Feed
            </button>

            {/* Top Banner Ad if accessed via 'ads' */}
            {articleAccess[activeArticle.id] === 'ads' && (
               <div className="mb-8 w-full h-24 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                  <span className="text-xs text-slate-400 font-mono">TOP BANNER ADVERTISEMENT</span>
               </div>
            )}

            <div className="mb-8">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wider text-xs uppercase mb-2 block">{activeArticle.category}</span>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                    {activeArticle.title}
                </h1>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-serif font-bold text-slate-500 dark:text-slate-400">
                            {activeArticle.author.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{activeArticle.author}</p>
                            <p className="text-xs text-slate-500">{activeArticle.date}</p>
                        </div>
                    </div>
                    {/* Access Status Indicator */}
                    {articleAccess[activeArticle.id] === 'paid' ? (
                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full text-xs font-medium">
                            <ShieldCheck className="w-3 h-3" />
                            Premium Access
                        </div>
                    ) : articleAccess[activeArticle.id] === 'subscribed' ? (
                         <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full text-xs font-medium">
                            <Crown className="w-3 h-3" />
                            Subscriber
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full text-xs font-medium">
                            <AlertCircle className="w-3 h-3" />
                            Ad-Supported View
                        </div>
                    )}
                </div>
            </div>

            <div className="prose prose-lg dark:prose-invert font-serif leading-loose text-slate-700 dark:text-slate-300">
                <p className="font-bold text-xl mb-6">{activeArticle.excerpt}</p>
                {activeArticle.content.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
                    <React.Fragment key={idx}>
                        <p className="mb-6">{paragraph}</p>
                        {/* INVASIVE ADS LOGIC */}
                        {articleAccess[activeArticle.id] === 'ads' && (
                             <TaboolaWidget variant="inline" />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Taboola Widget at bottom if accessed via 'ads' - Optional since we have them inline now, but keeping for max invasiveness */}
            {articleAccess[activeArticle.id] === 'ads' && <TaboolaWidget variant="footer" />}
          </article>
        )}

      </main>

      {/* Paywall Modal */}
      {showPaywall && activeArticle && (
        <PaywallModal 
            article={activeArticle}
            settings={settings}
            wallet={wallet}
            onPay={handleManualPay}
            onSubscribe={handleSubscribe}
            onAcceptAds={handleViewWithAds}
            onCancel={() => setShowPaywall(false)}
        />
      )}
    </div>
  );
}