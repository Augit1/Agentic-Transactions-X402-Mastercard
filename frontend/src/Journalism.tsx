import React, { useState, useEffect, useCallback } from 'react';
import { MOCK_ARTICLES, INITIAL_SETTINGS, INITIAL_WALLET } from './constants';
import { type Article, type UserSettings, type WalletState } from './types';
import SettingsDrawer from './components/SettingsDrawer';
import ArticleCard from './components/ArticleCard';
import PaywallModal from './components/PaywallModal';
import TaboolaWidget from './components/TaboolaWidget';
import AnnoyingVideoAds from './components/AnnoyingVideoAds';
import { Settings, LayoutGrid, ArrowLeft, ShieldCheck, AlertCircle, Crown } from 'lucide-react';
import axios from 'axios';

const PROVIDER_URL = "http://localhost:4002";
const ORCH_URL = "http://localhost:4003";
import JournalismNav from './JournalismNav'; // ⬅️ Importamos el componente de navegación

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
    window.location.hash = '';
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
    navigateToArticle(article.id, false);
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
                className={`p-2 rounded-lg transition-colors relative ${isSettingsOpen ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
              >
                <Settings className="w-6 h-6" />
                {!wallet.isFunded && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* <JournalismNav 
        onGoHome={goHome}
        isSettingsOpen={isSettingsOpen}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
      /> */}

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
            onFundWallet={handleFundWallet}
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
                {!wallet.isFunded && (
                    <div className="mt-6">
                        <button 
                            onClick={() => setIsSettingsOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-full shadow-lg hover:shadow-xl transition-all animate-bounce"
                        >
                            Setup Wallet to Start
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
          <article className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative">
            
            {/* ANNOYING VIDEO ADS if accessed via 'ads' */}
            {articleAccess[activeArticle.id] === 'ads' && <AnnoyingVideoAds />}

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