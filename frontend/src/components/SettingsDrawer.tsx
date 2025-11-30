import React, { useState, useEffect } from 'react';
import { type UserSettings, type WalletState } from '../types';
import { X, CreditCard, ShieldCheck, Activity, Save, RotateCcw, Coffee, ShoppingBag, Fuel, Utensils } from 'lucide-react';

// Mock recent purchases that generated cashback
const MOCK_CASHBACK_HISTORY = [
  { merchant: 'Starbucks', amount: 8.50, cashback: 0.43, icon: Coffee, time: '2 hours ago' },
  { merchant: 'Amazon', amount: 45.99, cashback: 2.30, icon: ShoppingBag, time: 'Yesterday' }
];

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  wallet: WalletState;
  onSaveSettings: (newSettings: UserSettings) => void;
  onReset: () => void;
  onFundWallet: () => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  wallet,
  onSaveSettings,
  onReset,
  onFundWallet,
}) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isFunding, setIsFunding] = useState(false);

  // Sync local state when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSaveSettings(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetClick = () => {
    onReset();
    setCardNumber('');
    setCardName('');
    setExpiry('');
    setCvc('');
  };

  const handleFundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFunding(true);
    // Simulate network request
    setTimeout(() => {
        onFundWallet();
        setIsFunding(false);
    }, 1500);
    const response = await fetch('http://localhost:4003/mastercard/');
    const data = await response.json();
    console.log('Mastercard API Response:', data);  
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-4 z-50 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
      
      {/* Header */}
      <div className="bg-slate-100 dark:bg-slate-800 p-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          {wallet.isFunded ? 'Wallet Configuration' : 'Setup Wallet'}
        </h3>
        <button 
          onClick={onClose}
          className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!wallet.isFunded ? (
        // --- UNLINKED STATE: LINK MASTERCARD ---
        <div className="p-6">
            <div className="mb-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                    <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                    Link Your Mastercard
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                    Earn <span className="font-semibold text-indigo-600">5% cashback</span> on every purchase you make with your linked card.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your cashback automatically funds micropayments for premium content — no extra charges, ever.
                </p>
            </div>
            
            {/* How it works */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">How it works:</p>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-[10px]">1</div>
                        <span>Link your Mastercard below</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-[10px]">2</div>
                        <span>Make purchases anywhere as usual</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-[10px]">3</div>
                        <span>5% cashback funds your content access</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleFundSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Card Number</label>
                    <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Cardholder Name</label>
                    <input 
                        type="text" 
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        required
                    />
                </div>
                <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Expiry</label>
                        <input 
                            type="text" 
                            placeholder="MM/YY"
                            maxLength={5}
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                            required
                        />
                    </div>
                    <div className="w-24">
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">CVC</label>
                        <input 
                            type="text" 
                            placeholder="123"
                            maxLength={3}
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isFunding}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-white shadow-lg transition-all"
                >
                    {isFunding ? (
                        <>Linking Card...</>
                    ) : (
                        <>
                            <CreditCard className="w-4 h-4" /> Link Mastercard
                        </>
                    )}
                </button>
                <p className="text-[10px] text-center text-slate-400">
                    Secured by Mastercard. Your card details are encrypted.
                </p>
            </form>
        </div>
      ) : (
        // --- LINKED STATE: CASHBACK BALANCE & SETTINGS ---
        <>
            {/* Cashback Balance Card */}
            <div className="p-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white mx-4 mt-4 rounded-lg shadow-lg">
                <div className="flex justify-between items-start mb-1">
                    <div>
                        <p className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Cashback Balance</p>
                        <p className="text-3xl font-bold">${wallet.balance.toFixed(2)}</p>
                    </div>
                    <div className="flex relative">
                        <div className="w-6 h-6 rounded-full bg-red-500 z-10"></div>
                        <div className="w-6 h-6 rounded-full bg-yellow-500 -ml-2 z-0"></div>
                    </div>
                </div>
                <p className="text-xs text-emerald-100 mb-3">Available for premium content</p>
                <div className="flex items-center gap-2 text-xs text-emerald-50 bg-emerald-600/30 rounded-md px-2 py-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></div>
                    Earning 5% on all purchases
                </div>
            </div>

            {/* Recent Cashback Activity */}
            <div className="mx-4 mt-4">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Recent Cashback
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                    {MOCK_CASHBACK_HISTORY.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                    <item.icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.merchant}</p>
                                    <p className="text-[10px] text-slate-400">{item.time}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+${item.cashback.toFixed(2)}</p>
                                <p className="text-[10px] text-slate-400">${item.amount.toFixed(2)} spent</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Settings Form */}
            <div className="p-6 space-y-6">
                <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Max Payment Per Article ($)
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                    type="number"
                    step="0.01"
                    min="0.0"
                    value={localSettings.maxPaymentPerArticle}
                    onChange={(e) => setLocalSettings({ ...localSettings, maxPaymentPerArticle: parseFloat(e.target.value) })}
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
                <p className="text-xs text-slate-500 mt-1">If article price is below this, payment is auto-approved.</p>
                </div>

                <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Max Daily Spend ($)
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                    type="number"
                    step="0.10"
                    min="0.10"
                    value={localSettings.maxPaymentPerDay}
                    onChange={(e) => setLocalSettings({ ...localSettings, maxPaymentPerDay: parseFloat(e.target.value) })}
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
                </div>

                {/* Usage Stats */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <Activity className="w-4 h-4" />
                        <span>Today's Activity</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-1">
                        <div 
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min((localSettings.spentToday / localSettings.maxPaymentPerDay) * 100, 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Spent: ${localSettings.spentToday.toFixed(2)}</span>
                        <span>Limit: ${localSettings.maxPaymentPerDay.toFixed(2)}</span>
                    </div>
                </div>

                <button
                onClick={handleSave}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
                    isSaved 
                    ? 'bg-green-500 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
                }`}
                >
                {isSaved ? (
                    <>Saved Successfully</>
                ) : (
                    <><Save className="w-4 h-4" /> Save Configuration</>
                )}
                </button>

                {/* Reset Actions */}
                <div className="pt-4 mt-2 border-t border-gray-200 dark:border-slate-700">
                    <button
                        onClick={handleResetClick}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Unlink Card & Reset
                    </button>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default SettingsDrawer;