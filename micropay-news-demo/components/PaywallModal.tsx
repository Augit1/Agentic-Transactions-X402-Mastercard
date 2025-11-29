import React, { useState } from 'react';
import { Article, UserSettings, WalletState } from '../types';
import { Zap, AlertTriangle, CheckCircle2, LayoutTemplate, Crown } from 'lucide-react';

interface PaywallModalProps {
  article: Article;
  settings: UserSettings;
  wallet: WalletState;
  onPay: () => Promise<void>;
  onSubscribe: () => Promise<void>;
  onAcceptAds: () => void;
  onCancel: () => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({
  article,
  settings,
  wallet,
  onPay,
  onSubscribe,
  onAcceptAds,
  onCancel,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAfford = wallet.balance >= article.price;
  const isWithinDailyLimit = (settings.spentToday + article.price) <= settings.maxPaymentPerDay;
  const isWithinArticleLimit = article.price <= settings.maxPaymentPerArticle;
  
  const handlePayClick = async () => {
    setError(null);
    setIsProcessing(true);

    if (!canAfford) {
      setTimeout(() => {
        setIsProcessing(false);
        setError("Insufficient funds in BSV wallet.");
      }, 800);
      return;
    }

    if (!isWithinDailyLimit) {
        setTimeout(() => {
            setIsProcessing(false);
            setError(`Daily spend limit ($${settings.maxPaymentPerDay}) reached.`);
        }, 800);
        return;
    }
    
    try {
      await onPay();
    } catch (e) {
      setError("Transaction failed.");
      setIsProcessing(false);
    }
  };

  const handleSubscribeClick = async () => {
      setError(null);
      setIsProcessing(true);
      try {
          await onSubscribe();
      } catch (e) {
          setIsProcessing(false);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-800 p-6 text-center border-b border-gray-200 dark:border-slate-700">
           <h3 className="text-xl font-bold text-slate-900 dark:text-white font-serif">Unlock This Article</h3>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
             Choose how you want to support independent journalism.
           </p>
        </div>

        <div className="p-6 space-y-3">
          
          {/* Option 1: Microtransaction */}
          <button
            onClick={handlePayClick}
            disabled={isProcessing}
            className={`w-full group relative flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
               isProcessing 
               ? 'border-indigo-200 bg-indigo-50' 
               : 'border-indigo-600 bg-white hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-indigo-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isProcessing ? 'bg-indigo-200' : 'bg-indigo-100 text-indigo-600'}`}>
                {isProcessing ? (
                     <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <Zap className="w-5 h-5" />
                )}
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900 dark:text-white">Pay ${article.price.toFixed(2)}</p>
                <p className="text-xs text-slate-500">One-time payment. Instant access.</p>
              </div>
            </div>
            {isWithinArticleLimit && isWithinDailyLimit && canAfford && !isProcessing && (
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Auto
                </span>
            )}
          </button>

          {/* Option 2: Subscription */}
          <button
            onClick={handleSubscribeClick}
            disabled={isProcessing}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-purple-500 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/10 dark:hover:bg-purple-900/20 transition-colors text-left"
          >
            <div className="p-2 rounded-full bg-purple-200 text-purple-700 dark:bg-purple-800 dark:text-purple-300">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-purple-900 dark:text-purple-100">Subscribe Premium</p>
              <p className="text-xs text-purple-700 dark:text-purple-300">Unlimited Access. No Ads.</p>
            </div>
            <div className="text-right">
                <span className="font-bold text-purple-900 dark:text-purple-100">€12</span>
                <span className="text-xs block text-purple-700 dark:text-purple-300">/mo</span>
            </div>
          </button>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
            </div>
          )}

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-medium">OR</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          {/* Option 3: Ads */}
          <button
            onClick={onAcceptAds}
            disabled={isProcessing}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="p-2 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">View with Ads</p>
              <p className="text-xs text-slate-500">Free. Includes personalized ads.</p>
            </div>
          </button>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 text-center">
             <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline">
                 Cancel
             </button>
        </div>

      </div>
    </div>
  );
};

export default PaywallModal;