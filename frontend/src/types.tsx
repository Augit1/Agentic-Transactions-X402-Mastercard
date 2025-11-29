// Definición de las claves para el LogType
export const LogType = {
  CONSUMER: '🤖 Consumidor',
  PROVIDER: '🤖 Proveedor',
  ORCHESTRATOR: '⚙️ Orquestador',
  MASTERCARD: '💳 Mastercard (mock)',
  BSV_ADAPTER: '⛓️ BSV Adapter',
  SUCCESS: '✅ Éxito',
  ERROR: '❌ Error',
} as const;

// Tipo para el remitente del log
export type LogSender = (typeof LogType)[keyof typeof LogType];

// Estructura de un item del log
export interface LogItem {
  sender: LogSender | '✅ Éxito' | '❌ Error';
  message: string;
  timestamp: string;
}

// Tipos para el estado de los pasos en la línea de tiempo
export type StepStatus = 'pending' | 'active' | 'completed';

// Propiedades para el componente TimelineStep
export interface TimelineStepProps {
  title: string;
  status: StepStatus;
  stepIndex: number;
}

// Propiedades para los chips de participantes
export interface Participant {
  label: LogSender;
  color: string;
}

// Pasos de la transacción
export const STEPS: string[] = [
  'El Agente Consumidor crea la petición de servicio.',
  'El Agente Proveedor envía la cotización (quote) y X402 Request.',
  'Orquestador verifica y autoriza el pago con Mastercard (mock).',
  'Orquestador liquida la transacción en BSV (simulado).',
  'El Proveedor entrega el servicio digital al Consumidor.',
];

// Los participantes clave para los chips
export const participants: Participant[] = [
  { label: LogType.CONSUMER, color: 'bg-blue-600' },
  { label: LogType.PROVIDER, color: 'bg-indigo-600' },
  { label: LogType.ORCHESTRATOR, color: 'bg-purple-600' },
  { label: LogType.MASTERCARD, color: 'bg-red-600' },
  { label: LogType.BSV_ADAPTER, color: 'bg-green-600' },
];
