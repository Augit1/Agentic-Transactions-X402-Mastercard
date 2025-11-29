export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string; // The full content (hidden until paid)
  author: string;
  category: string;
  imageUrl: string;
  price: number; // e.g., 0.02
  date: string;
}

export interface WalletState {
  balance: number;
  currency: string;
  isFunded: boolean;
}

export interface UserSettings {
  maxPaymentPerArticle: number;
  maxPaymentPerDay: number;
  spentToday: number;
  lastResetDate: string; // To track when to reset 'spentToday'
}

export interface Transaction {
  id: string;
  articleId: string;
  amount: number;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
}