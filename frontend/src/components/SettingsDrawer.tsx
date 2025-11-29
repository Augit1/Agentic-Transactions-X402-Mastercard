import React, { useState, useEffect } from 'react';
import { type UserSettings, type WalletState } from '../types';
import { X, CreditCard, ShieldCheck, Activity, Save, RotateCcw } from 'lucide-react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  wallet: WalletState;
  onSaveSettings: (newSettings: UserSettings) => void;
  onReset: () => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  wallet,
  onSaveSettings,
  onReset,
}) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

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
    // Visual feedback handled by parent state update
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-4 z-50 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
      
      {/* Header */}
      <div className="bg-slate-100 dark:bg-slate-800 p-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          Wallet Configuration
        </h3>
        <button 
          onClick={onClose}
          className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Wallet Balance Card */}
      <div className="p-5 bg-linear-to-r from-indigo-600 to-blue-600 text-white mx-4 mt-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-medium text-indigo-200 uppercase tracking-wider">Balance</p>
            <p className="text-2xl font-bold">${wallet.balance.toFixed(2)} <span className="text-sm font-normal opacity-80">USDC</span></p>
          </div>
          <CreditCard className="w-8 h-8 opacity-50" />
        </div>
        <div className="flex items-center gap-2 text-xs text-indigo-100">
           <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
           Funded via Mastercard Credit Line
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
              min="0.01"
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
                 Reset Balance & Relock
             </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsDrawer;