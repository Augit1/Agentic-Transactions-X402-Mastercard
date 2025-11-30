import React, { useState, useEffect, useCallback } from 'react';
import { MOCK_ARTICLES, INITIAL_SETTINGS, INITIAL_WALLET } from './constants';
import { type Article, type UserSettings, type WalletState } from './types';
import SettingsDrawer from './components/SettingsDrawer';
import ArticleCard from './components/ArticleCard';
import PaywallModal from './components/PaywallModal';
import TaboolaWidget from './components/TaboolaWidget';
import AnnoyingVideoAds from './components/AnnoyingVideoAds';
import { Settings, ArrowLeft, ShieldCheck, AlertCircle, Crown, ChevronLeft, ChevronRight, RotateCw, Lock, Menu } from 'lucide-react';
import axios from 'axios';
import { FadeInUp } from './components/ui/TextAnimations';

const PROVIDER_URL = "http://localhost:4002";
const ORCH_URL = "http://localhost:4003";

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

// Unique hash codes for each article - simulating server-generated codes
// Premium (no ads) and Ad-supported versions have completely different hashes
const ARTICLE_HASHES: Record<string, { premium: string; ads: string }> = {
  '1': { premium: 'a7f3e2b1c9d8', ads: 'x4k9m2p7q3w1' },
  '2': { premium: 'b8c4d5e6f7a2', ads: 'y5l0n3r8s4v2' },
  '3': { premium: 'c9d5e6f7g8b3', ads: 'z6m1o4t9u5w3' },
  '4': { premium: 'd0e6f7g8h9c4', ads: 'a7n2p5v0x6y4' },
};

// Reverse lookup: hash -> { articleId, withAds }
const HASH_TO_ARTICLE: Record<string, { articleId: string; withAds: boolean }> = {};
Object.entries(ARTICLE_HASHES).forEach(([articleId, hashes]) => {
  HASH_TO_ARTICLE[hashes.premium] = { articleId, withAds: false };
  HASH_TO_ARTICLE[hashes.ads] = { articleId, withAds: true };
});

// Helper to parse hash URL
function parseArticleHash(hash: string): { articleId: string | null; withAds: boolean } {
  if (!hash || hash === '#') return { articleId: null, withAds: false };
  
  // Remove leading #
  const cleanHash = hash.replace(/^#/, '');
  
  // Look up the hash in our mapping
  const mapping = HASH_TO_ARTICLE[cleanHash];
  if (mapping) {
    return mapping;
  }
  
  return { articleId: null, withAds: false };
}

// Get hash code for an article
function getArticleHash(articleId: string, withAds: boolean): string {
  const hashes = ARTICLE_HASHES[articleId];
  if (!hashes) return '';
  return withAds ? hashes.ads : hashes.premium;
}

export default function Journalism() {
  // --- State ---
  const [settings, setSettings] = useStickyState<UserSettings>(INITIAL_SETTINGS, 'user_settings');
  const [wallet, setWallet] = useStickyState<WalletState>(INITIAL_WALLET, 'user_wallet');
  
  // Replaces simple string[] with a record of how it was accessed
  const [articleAccess, setArticleAccess] = useStickyState<Record<string, AccessMethod>>({}, 'article_access_registry');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'article'>('list');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // --- Hash-based URL routing ---
  
  // Navigate to article via hash
  const navigateToArticle = useCallback((articleId: string, withAds: boolean) => {
    const hashCode = getArticleHash(articleId, withAds);
    if (hashCode) {
      window.location.hash = hashCode;
    }
  }, []);

  // Navigate back to list
  const navigateToList = useCallback(() => {
    // Use history API to avoid scrolling to top which happens with window.location.hash = ''
    history.pushState(null, '', window.location.pathname + window.location.search);
    setCurrentView('list');
    setSelectedArticleId(null);
  }, []);

  // Handle hash changes (back/forward browser navigation)
  useEffect(() => {
    const handleHashChange = () => {
      const { articleId, withAds } = parseArticleHash(window.location.hash);
      
      if (articleId) {
        const article = MOCK_ARTICLES.find(a => a.id === articleId);
        if (article) {
          setSelectedArticleId(articleId);
          setCurrentView('article');
          
          // If accessing via ads URL, grant ad-supported access
          if (withAds && !articleAccess[articleId]) {
            setArticleAccess(prev => ({ ...prev, [articleId]: 'ads' }));
          }
        }
      } else {
        setCurrentView('list');
        setSelectedArticleId(null);
      }
    };

    // Handle initial hash on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [articleAccess, setArticleAccess]);

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

  // If wallet is not funded, ensure settings drawer is open so they can fund it
  // But maybe only if they try to do something? 
  // For now, let's just let them explore, but they can't pay.

  const activeArticle = MOCK_ARTICLES.find(a => a.id === selectedArticleId);

  const handleArticleClick = async (article: Article) => {
    console.log('Article clicked:', article.id);
    setSelectedArticleId(article.id);
    const hasAccess = !!articleAccess[article.id];
    
    if (hasAccess) {
      console.log('Already has access, navigating to article');
      // Navigate using hash URL based on access type
      navigateToArticle(article.id, articleAccess[article.id] === 'ads');
      return;
    }

    // If wallet not funded, show paywall
    if (!wallet.isFunded) {
      console.log('Wallet not funded, showing paywall');
      setShowPaywall(true);
      return;
    }

    // Try to get quote from provider and auto-pay if within limits
    setIsProcessingPayment(true);
    try {
      // 1. Get quote from provider
      console.log('Fetching quote from provider...');
      const quoteRes = await axios.post(`${PROVIDER_URL}/quote`, {
        articleId: article.id,
      });
      const quote = quoteRes.data;
      console.log('Quote received:', quote);

      // 2. Check if within user's settings limits
      const canAfford = wallet.balance >= quote.price;
      const withinDaily = (settings.spentToday + quote.price) <= settings.maxPaymentPerDay;
      const withinArticleLimit = quote.price <= settings.maxPaymentPerArticle;
      
      console.log('Limit checks:', { 
        canAfford, 
        withinDaily, 
        withinArticleLimit,
        walletBalance: wallet.balance,
        quotePrice: quote.price,
        maxPaymentPerArticle: settings.maxPaymentPerArticle,
        maxPaymentPerDay: settings.maxPaymentPerDay,
        spentToday: settings.spentToday
      });

      if (!canAfford || !withinDaily || !withinArticleLimit) {
        // Show paywall if any limit exceeded
        console.log('Limits exceeded, showing paywall');
        setIsProcessingPayment(false);
        setShowPaywall(true);
        return;
      }

      // 3. Auto-pay through orchestrator - send the ads hash to get the premium hash back
      const adsHash = getArticleHash(article.id, true); // Get the ads hash for this article
      const payRes = await axios.post(`${ORCH_URL}/pay`, {
        x402_payment_request: quote.x402_payment_request,
        amount: quote.price,
        pay_to: quote.pay_to, // BSV address to pay to
        payer_agent_id: 'consumer-frontend',
        payee_agent_id: 'provider-1',
        article_hash: adsHash, // Send ads hash to orchestrator
      });
      const payment = payRes.data;
      console.log('Payment receipt:', payment);
      
      // The orchestrator returns the premium hash after successful payment
      if (payment.premium_hash) {
        console.log('Received premium hash:', payment.premium_hash);
      }

      if (payment.error) {
        console.error('Payment error:', payment.error);
        setIsProcessingPayment(false);
        setShowPaywall(true);
        return;
      }

      // 4. Execute with provider
      const execRes = await axios.post(`${PROVIDER_URL}/execute`, {
        request_id: quote.request_id,
        payment_receipt: payment,
      });
      const result = execRes.data;
      console.log('Service result:', result);

      // 5. Update local state - always deduct $0.05 for display purposes
      const DISPLAY_PRICE = 0.05;
      setWallet(prev => ({
        ...prev,
        balance: prev.balance - DISPLAY_PRICE
      }));
      setSettings(prev => ({
        ...prev,
        spentToday: prev.spentToday + DISPLAY_PRICE
      }));
      setArticleAccess(prev => ({ ...prev, [article.id]: 'paid' }));
      
      // Navigate using the premium hash returned by orchestrator
      if (payment.premium_hash) {
        window.location.hash = payment.premium_hash;
      } else {
        navigateToArticle(article.id, false);
      }

    } catch (e: any) {
      console.error('Error during auto-pay:', e);
      setShowPaywall(true);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleManualPay = async (_amountPaid: number) => {
    if (!activeArticle) return;
    
    // Always deduct $0.05 for display purposes (regardless of actual transaction amount)
    const DISPLAY_PRICE = 0.05;
    
    setWallet(prev => ({
        ...prev,
        balance: prev.balance - DISPLAY_PRICE
    }));

    // Update Spend Tracker
    setSettings(prev => ({
        ...prev,
        spentToday: prev.spentToday + DISPLAY_PRICE
    }));

    // Unlock Content as PAID
    setArticleAccess(prev => ({ ...prev, [activeArticle.id]: 'paid' }));
    
    // Navigate
    setShowPaywall(false);
    navigateToArticle(activeArticle.id, false);
  };

  const handleSubscribe = async () => {
      if (!activeArticle) return;
      // Simulate sub delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Unlock as Subscribed
      setArticleAccess(prev => ({ ...prev, [activeArticle.id]: 'subscribed' }));
      setShowPaywall(false);
      navigateToArticle(activeArticle.id, false);
  };

  const handleViewWithAds = () => {
    if (!activeArticle) return;
    // Unlock Content as ADS
    setArticleAccess(prev => ({ ...prev, [activeArticle.id]: 'ads' }));
    setShowPaywall(false);
    navigateToArticle(activeArticle.id, true);
  };

  const handleReset = () => {
    // Resets to initial state (Unfunded)
    setWallet(INITIAL_WALLET);
    setArticleAccess({});
    setSettings(INITIAL_SETTINGS);
  };

  const handleFundWallet = () => {
      setWallet({
          balance: 5.00,
          currency: 'USDC',
          isFunded: true
      });
  };

  const goHome = () => {
    navigateToList();
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-stone-200 dark:bg-stone-950 p-4 md:p-8 font-sans flex flex-col items-center selection:bg-indigo-200 dark:selection:bg-indigo-900 gap-6">
      
      {/* Header Section */}
      <div className="max-w-6xl w-full">
          <header className="border-b border-slate-400 dark:border-slate-600 pb-4">
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                  <FadeInUp>
                      Hackathon Demo: Consumer Use Case
                  </FadeInUp>
              </h1>
              <div className="mt-2 text-xl text-slate-600 dark:text-slate-300">
                  Experience seamless micropayments for content access. 
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                      Fund your wallet with 
                      <span className="font-mono text-red-600 dark:text-red-400 font-bold">
                          Mastercard
                      </span>
                      cashback, and pay per article using
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                          X402
                      </span>
                      protocols.
                  </div>
              </div>
          </header>
      </div>

      {/* Mock Browser Window */}
      <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-300 dark:border-slate-800 flex flex-col h-[85vh] md:h-[90vh] relative">
        
        {/* Browser Toolbar */}
        <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 flex items-center gap-4 shrink-0">
            {/* Window Controls */}
            <div className="flex gap-2 mr-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-600/20"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-600/20"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-600/20"></div>
            </div>

            {/* Navigation Controls */}
            <div className="flex gap-2 text-slate-500 dark:text-slate-400">
                <button 
                    onClick={goHome} 
                    className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md"
                    title="Back"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                    className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors opacity-50 cursor-not-allowed p-1"
                    title="Forward"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => window.location.reload()} 
                    className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md"
                    title="Reload"
                >
                    <RotateCw className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Address Bar */}
            <div className="flex-1 bg-white dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-700 h-8 flex items-center px-3 gap-2 text-sm shadow-sm group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <Lock className="w-3 h-3 text-green-600 dark:text-green-500" />
                <span className="text-green-600 dark:text-green-500 font-medium text-xs hidden sm:inline">Secure</span>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
                <span className="text-slate-600 dark:text-slate-400 flex-1 font-mono text-xs md:text-sm truncate selection:bg-indigo-100">
                    https://elmunde.es/{selectedArticleId ? `noticias/2025/11/30/${selectedArticleId}` : ''}
                </span>
                
                {/* Settings Button inside Address Bar */}
                 <button 
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="ml-auto hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-md transition-colors relative flex items-center gap-2"
                    title="Wallet Settings"
                >
                    {!wallet.isFunded && (
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    )}
                    <Settings className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                </button>
            </div>

            {/* Menu/Extensions */}
            <div className="flex gap-3 text-slate-500 dark:text-slate-400 items-center">
                 <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                    C
                 </div>
                 <Menu className="w-5 h-5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300" />
            </div>
        </div>

        {/* Browser Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto relative bg-white scrollbar-thin scrollbar-thumb-slate-200">
            
            {/* Settings Drawer - Positioned absolutely within the browser window context if possible, or fixed */}
            <SettingsDrawer 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
                settings={settings}
                wallet={wallet}
                onSaveSettings={setSettings}
                onReset={handleReset}
                onFundWallet={handleFundWallet}
            />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {currentView === 'list' && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-12 mt-4 border-b border-slate-200 pb-8">
                <h1 className="text-6xl md:text-8xl font-serif font-black mb-2 text-slate-900 tracking-tighter uppercase">
                    EL MUNDE
                </h1>
                <div className="flex justify-center items-center gap-4 text-sm font-serif text-slate-500 border-t border-b border-slate-200 py-2 max-w-2xl mx-auto mt-4">
                    <span>DOMINGO 30 DE NOVIEMBRE DE 2025</span>
                    <span>•</span>
                    <span>EDICIÓN MADRID</span>
                    <span>•</span>
                    <span>FUNDADO EN 2025</span>
                </div>
                {!wallet.isFunded && (
                    <div className="mt-6">
                        <button 
                            onClick={() => setIsSettingsOpen(true)}
                            className="bg-[#005596] hover:bg-[#00447a] text-white font-bold py-2 px-6 rounded-sm shadow-sm transition-all uppercase text-sm tracking-wider"
                        >
                            Suscríbete / Conectar Wallet
                        </button>
                    </div>
                )}
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

            {/* Processing Payment Overlay */}
            {isProcessingPayment && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">Processing payment...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'article' && activeArticle && (
          <article className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500 bg-white pt-8 pb-20 px-4 md:px-8 relative">
            
            {/* ANNOYING VIDEO ADS if accessed via 'ads' */}
            {articleAccess[activeArticle.id] === 'ads' && <AnnoyingVideoAds />}

            <button 
                onClick={goHome} 
                className="group flex items-center text-xs font-bold text-[#005596] hover:text-[#00447a] mb-8 transition-colors uppercase tracking-wider"
            >
                <ArrowLeft className="w-3 h-3 mr-1 group-hover:-translate-x-1 transition-transform" /> 
                Volver a Portada
            </button>

            {/* Top Banner Ad if accessed via 'ads' */}
            {articleAccess[activeArticle.id] === 'ads' && (
               <div className="mb-8 w-full h-24 bg-slate-100 flex items-center justify-center border border-dashed border-slate-300 rounded-lg">
                  <span className="text-xs text-slate-400 font-mono">PUBLICIDAD</span>
               </div>
            )}

            <div className="mb-8 border-b border-slate-200 pb-8">
                <span className="text-[#005596] font-bold tracking-wider text-sm uppercase mb-3 block border-b-2 border-[#005596] inline-block pb-1">{activeArticle.category}</span>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                    {activeArticle.title}
                </h1>
                <p className="text-xl md:text-2xl font-serif text-slate-600 mb-6 leading-relaxed">
                    {activeArticle.excerpt}
                </p>
                
                <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                             {/* Use article image as author avatar fallback or placeholder */}
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeArticle.author}`} alt={activeArticle.author} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">{activeArticle.author}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
                                <span>Madrid</span>
                                <span>•</span>
                                <span>Actualizado {activeArticle.date}</span>
                            </div>
                        </div>
                    </div>
                    {/* Access Status Indicator */}
                    {articleAccess[activeArticle.id] === 'paid' ? (
                        <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wide border border-green-200">
                            <ShieldCheck className="w-3 h-3" />
                            Premium
                        </div>
                    ) : articleAccess[activeArticle.id] === 'subscribed' ? (
                         <div className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wide border border-purple-200">
                            <Crown className="w-3 h-3" />
                            Suscrito
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-orange-700 bg-orange-50 px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wide border border-orange-200">
                            <AlertCircle className="w-3 h-3" />
                            Con Anuncios
                        </div>
                    )}
                </div>
            </div>

            <div className="prose prose-lg font-serif leading-loose text-slate-800 max-w-none">
                {/* First paragraph drop cap style could be added here if supported by tailwind typography plugin easily, otherwise standard */}
                {activeArticle.content.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
                    <React.Fragment key={idx}>
                        <p className="mb-6 text-lg">{paragraph}</p>
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
      </div>
    </div>
  );
}