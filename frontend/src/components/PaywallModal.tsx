import React, { useState } from 'react';
import { type Article, type UserSettings, type WalletState } from '../types';
import { Zap, AlertTriangle, CheckCircle2, LayoutTemplate, Crown } from 'lucide-react';
import axios from 'axios';

const PROVIDER_URL = "http://localhost:4002";
const ORCH_URL = "http://localhost:4003";

interface PaywallModalProps {
  article: Article;
  settings: UserSettings;
  wallet: WalletState;
  onPay: (amountPaid: number) => Promise<void>;
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
  
  const handlePayClick = async () => {
    setError(null);
    setIsProcessing(true);

    if (!canAfford) {
      setTimeout(() => {
        setIsProcessing(false);
        setError("Insufficient funds in wallet.");
      }, 800);
      return;
    }
    
    try {
      // 1. Get a payment quote from the PROVIDER
      const quoteRes = await axios.post(`${PROVIDER_URL}/quote`, {
        articleId: article.id,
      });

      const quote = quoteRes.data;
      console.log('Quote received:', quote);

      // 2. Pay through Orchestrator (no max/daily checks - popup is the override)
      const payRes = await axios.post(`${ORCH_URL}/pay`, {
        x402_payment_request: quote.x402_payment_request,
        amount: quote.price,
        payer_agent_id: 'consumer-frontend',
        payee_agent_id: 'provider-1',
      });

      const payment = payRes.data;
      console.log('Payment receipt received:', payment);
      if (payment.error) {
        setError(payment.error);
        setIsProcessing(false);
        return;
      }

      // 4. Call Provider execute endpoint with payment receipt
      const execRes = await axios.post(`${PROVIDER_URL}/execute`, {
        request_id: quote.request_id,
        payment_receipt: payment,
      });

      const result = execRes.data;

      if (result.error) {
        setError(result.error);
        setIsProcessing(false);
        return;
      }

      console.log('Payment complete:', { quote, payment, result });

      // Call the parent's onPay to update UI state with amount paid
      await onPay(quote.price);
    } catch (e: any) {
      console.error('Payment error:', e);
      setError(e.response?.data?.error || e.message || "Transaction failed.");
    } finally {
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
                <p className="font-bold text-slate-900 dark:text-white">Pay $0.05000</p>
                <p className="text-xs text-slate-500">One-time payment. Instant access. No cookies.</p>
              </div>
            </div>
            {canAfford && !isProcessing && (
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready
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
            <div className="grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="shrink mx-4 text-slate-400 text-xs font-medium">OR</span>
            <div className="grow border-t border-slate-200 dark:border-slate-700"></div>
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
              <p className="font-semibold text-slate-700 dark:text-slate-300">View for free</p>
              <p className="text-xs text-slate-500">With your consent, we and our partners use cookies or similar technologies to store, access, and process personal data like your visit on this website.</p>
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