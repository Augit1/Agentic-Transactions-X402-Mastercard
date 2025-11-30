import { type Article, type UserSettings, type WalletState } from './types';

export const DEFAULT_WALLET_BALANCE = 5.00; // $5.00 USDC start
export const DEFAULT_ARTICLE_PRICE = 0.02; // $0.02

export const INITIAL_SETTINGS: UserSettings = {
  maxPaymentPerArticle: 0, // Default changed to 0 to force popup interaction
  maxPaymentPerDay: 0.50,
  spentToday: 0,
  lastResetDate: new Date().toDateString(),
};

export const INITIAL_WALLET: WalletState = {
  balance: 0,
  currency: 'USDC',
  isFunded: false,
};

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: ' The Future of Decentralized Media',
    excerpt: 'How blockchain microtransactions are solving the advertising crisis in modern journalism.',
    content: `For decades, the internet has struggled with a fundamental problem: how to monetize content without invading user privacy. The ad-driven model has led to clickbait, tracking pixels, and a degradation of user experience.

    Enter the microtransaction. By utilizing low-fee blockchains like BSV, we can finally enable a pay-per-view model that actually works. Imagine paying $0.02 for an article instantly, without signing up, without monthly subscriptions, and without being tracked across the web.

    This shift shifts the power dynamic back to the reader. You pay for what you value, and creators get paid directly. It creates a direct economic link between quality and revenue, rather than attention and revenue.`,
    author: 'Satoshi Nakamoto',
    category: 'Technology',
    imageUrl: 'https://picsum.photos/800/600?random=1',
    price: 0.02,
    date: 'Oct 24, 2023'
  },
  {
    id: '2',
    title: 'Global Markets React to New Energy Policies',
    excerpt: 'Stocks tumbled slightly on Monday as new regulations regarding renewable energy credits were announced.',
    content: `Wall Street opened lower this week as uncertainty looms over the new renewable energy credit framework. Analysts suggest that while long-term growth is expected in the green sector, short-term adjustments will be painful for legacy energy providers.

    "It's a necessary correction," says Jane Doe, Chief Strategist at GlobalFin. "We are seeing a reallocation of capital that aligns with 2030 sustainability goals."

    Investors are advised to hold steady and look for opportunities in emerging battery technologies and grid infrastructure modernization.`,
    author: 'Elena Fisher',
    category: 'Finance',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    price: 0.02,
    date: 'Oct 23, 2023'
  },
  {
    id: '3',
    title: 'Understanding the Coffee Supply Chain',
    excerpt: 'From bean to cup, the journey of your morning brew is more complex than you might imagine.',
    content: `The coffee supply chain is a marvel of modern logistics, yet it remains fragile. A frost in Brazil or a shipping delay in the Suez Canal can send ripples through your local coffee shop's prices.

    We traveled to Colombia to meet with farmers who are implementing new organic farming techniques to combat climate change. The results are promising: higher yields and better flavor profiles, but at a higher labor cost.

    This article explores the economics of fair trade and what it really means for the farmer at the other end of the supply chain.`,
    author: 'Marcus Aurelius',
    category: 'Lifestyle',
    imageUrl: 'https://picsum.photos/800/600?random=3',
    price: 0.02,
    date: 'Oct 22, 2023'
  },
  {
    id: '4',
    title: 'Minimalism in Digital Design',
    excerpt: 'Why the best interfaces are often the ones you notice the least.',
    content: `In an era of notification overload, digital design is trending back towards silence. Minimalism isn't just about white space; it's about cognitive load management.

    Designers are now prioritizing 'calm technology'—interfaces that inform without demanding attention. This philosophy is evident in the latest OS updates from major tech giants, which focus on focus modes and screen time reduction.

    We analyze the top 5 design trends for 2024 that embrace this less-is-more approach.`,
    author: 'Sarah Jenkins',
    category: 'Design',
    imageUrl: 'https://picsum.photos/800/600?random=4',
    price: 0.02,
    date: 'Oct 21, 2023'
  }
];