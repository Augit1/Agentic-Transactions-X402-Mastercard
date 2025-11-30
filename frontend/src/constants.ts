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
    title: 'El Gobierno anuncia una subida del salario mínimo del 4,5% para 2026',
    excerpt: 'La ministra de Trabajo confirma el acuerdo con los sindicatos tras semanas de intensas negociaciones en La Moncloa.',
    content: `El Consejo de Ministros ha aprobado este viernes una subida del Salario Mínimo Interprofesional (SMI) del 4,5% para el próximo año, lo que situará esta referencia salarial en 1.184 euros mensuales en 14 pagas.

    La ministra de Trabajo, Yolanda Díaz, ha comparecido tras la reunión del Ejecutivo para anunciar el acuerdo alcanzado con CCOO y UGT, después de semanas de intensas negociaciones que han incluido varias reuniones nocturnas en el Palacio de La Moncloa.

    "Este es un paso más hacia la dignificación del trabajo en España", ha declarado la vicepresidenta segunda. "Ningún trabajador a tiempo completo debería vivir en situación de pobreza".

    La patronal CEOE ha rechazado sumarse al acuerdo, alegando que la subida "pone en riesgo la competitividad de las pequeñas y medianas empresas españolas" en un contexto de incertidumbre económica.`,
    author: 'María García López',
    category: 'Política',
    imageUrl: 'https://picsum.photos/800/600?random=10',
    price: 0.02,
    date: '29 Nov, 2025'
  },
  {
    id: '2',
    title: 'Feijóo exige la dimisión de Sánchez tras las revelaciones del caso Koldo',
    excerpt: 'El líder del PP acusa al presidente de "mentir sistemáticamente" y anuncia una moción de censura si no convoca elecciones.',
    content: `El presidente del Partido Popular, Alberto Núñez Feijóo, ha exigido este jueves la dimisión inmediata del presidente del Gobierno, Pedro Sánchez, tras las últimas revelaciones en el caso Koldo que implican a altos cargos del Ministerio de Transportes.

    En una rueda de prensa convocada de urgencia en la sede nacional del PP en la calle Génova, Feijóo ha acusado a Sánchez de "mentir sistemáticamente a los españoles" y de liderar "el Gobierno más corrupto de la democracia".

    "Si el señor Sánchez tiene un mínimo de dignidad, debe convocar elecciones de inmediato", ha declarado el líder de la oposición. "De lo contrario, el Partido Popular presentará una moción de censura en el Congreso".

    El Gobierno ha respondido a través de su portavoz, calificando las declaraciones de Feijóo de "desesperadas" y recordando que "las investigaciones judiciales deben seguir su curso sin interferencias políticas".`,
    author: 'Carlos Martínez Ruiz',
    category: 'España',
    imageUrl: 'https://picsum.photos/800/600?random=11',
    price: 0.02,
    date: '28 Nov, 2025'
  },
  {
    id: '3',
    title: 'La Generalitat desafía al Constitucional con una nueva ley de inmersión lingüística',
    excerpt: 'El Parlament aprueba una norma que elimina el requisito del 25% de castellano en las aulas catalanas.',
    content: `El Parlament de Catalunya ha aprobado este miércoles, con los votos de ERC, Junts y la CUP, una nueva ley de política lingüística que elimina el requisito del 25% de enseñanza en castellano establecido por el Tribunal Supremo.

    La norma, que entrará en vigor el próximo curso escolar, establece que el catalán será "la lengua vehicular y de aprendizaje del sistema educativo" sin porcentajes mínimos para el castellano.

    El presidente de la Generalitat ha defendido la ley como "un ejercicio legítimo de autogobierno" y ha advertido que su Ejecutivo "no acatará" posibles sentencias contrarias del Tribunal Constitucional.

    El Gobierno central ha anunciado que recurrirá la ley ante el Constitucional, mientras que asociaciones de padres como la AEB han convocado manifestaciones en Barcelona para el próximo fin de semana.`,
    author: 'Jordi Puig Soler',
    category: 'Cataluña',
    imageUrl: 'https://picsum.photos/800/600?random=12',
    price: 0.02,
    date: '27 Nov, 2025'
  },
  {
    id: '4',
    title: 'Ribera comparece en el Congreso por la gestión de la DANA mientras la UE espera',
    excerpt: 'La vicepresidenta tercera defiende la actuación del Gobierno ante las críticas de la oposición por la catástrofe de Valencia.',
    content: `La vicepresidenta tercera y ministra para la Transición Ecológica, Teresa Ribera, ha comparecido este martes en el Congreso de los Diputados para dar explicaciones sobre la gestión gubernamental de la DANA que devastó la provincia de Valencia el pasado octubre.

    Durante más de cuatro horas de comparecencia, Ribera ha defendido la actuación de su ministerio y ha responsabilizado a la Generalitat Valenciana de Carlos Mazón de "graves errores en la gestión de la emergencia".

    "Las alertas se enviaron a tiempo. Fue la Generalitat quien tardó en activar los protocolos de emergencia", ha declarado la ministra, provocando las protestas de los diputados del PP que han abandonado el hemiciclo.

    Mientras tanto, en Bruselas, el proceso de confirmación de Ribera como comisaria europea de Competencia permanece en suspenso a la espera de que se aclaren las responsabilidades políticas por la tragedia.`,
    author: 'Ana Belén Torres',
    category: 'Política',
    imageUrl: 'https://picsum.photos/800/600?random=13',
    price: 0.02,
    date: '26 Nov, 2025'
  }
];