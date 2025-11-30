import React, { useState } from 'react';
import TimeLineStep from './TimeLineStep.tsx';
import {FadeInUp} from './TextAnimations.tsx'
import {
  type LogItem,
  type LogSender,
  type StepStatus,
  LogType,
  STEPS, // Asumo que STEPS sigue siendo útil para la visualización del flujo
} from '../../types.tsx'; 

// Define la estructura de respuesta que esperamos del backend.
interface ServiceResponse {
    quote?: any; 
    payment?: any; 
    result?: {
        message: string;
        request_id: string;
        payment_txid: string;
        paid_amount_bsv: number;
        timestamp: string;
        access_url?: string;
    };
    error?: string;
}

// Simular latencia para los pasos de Mock (Mastercard) y visualización
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const BACKEND_URL = 'http://localhost:4001';

// Componente principal
const AgentDashboard: React.FC = () => {
    // Estado para la visualización
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [isTransactionRunning, setIsTransactionRunning] = useState<boolean>(false);
  const [finalResult, setFinalResult] = useState<string>('Resultado: todavía no se ha ejecutado el servicio.');

  const addLog = (sender: LogSender, message: string): void => {
    setLogs((prevLogs) => [
        ...prevLogs,
        { sender, message, timestamp: new Date().toLocaleTimeString() },
    ]);
    };

    const handleStartTransaction = async (): Promise<void> => {
        if (isTransactionRunning)
            return;

        // Reiniciar estados
        setCurrentStepIndex(0); // El flujo comienza en el paso 0
        setLogs([]);
        setIsTransactionRunning(true);
        setFinalResult('Resultado: Transacción en curso...');
        
        let data: ServiceResponse = {};
        let txid: string = '';
        let bsvAmount: number = 0;

        try {
            	  // --- PASO 1: Petición del Consumidor ---
            addLog(LogType.CONSUMER, `➡️ ${LogType.ORCHESTRATOR}: Iniciando llamada al servicio en ${BACKEND_URL}/call-service ...`);

            const res = await fetch(`${BACKEND_URL}/call-service`, {
                method: 'POST',
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP Error ${res.status}: ${errorText}`);
            }

            data = await res.json();
            
            if (data.error) {
                 throw new Error(data.error);
            }
            if (!data.quote || !data.payment || !data.result) {
                throw new Error("Respuesta del servicio incompleta (falta quote, payment o result).");
            }

            // Extraer datos clave de la respuesta real
            txid = data.payment.txid || 'N/A';
            bsvAmount = data.payment.amount || 0;
            const x402RequestId = data.quote.request_id || 'N/A';


            setCurrentStepIndex(0);
            addLog(LogType.CONSUMER, `➡️ ${LogType.PROVIDER}: Solicitud de servicio enviada.`);

	  // --- PASO 2: El Proveedor Envía la Quote ---
            setCurrentStepIndex(1);
            addLog(LogType.PROVIDER, `⬅️ ${LogType.CONSUMER}: El precio es ${bsvAmount} BSV. (ID: ${x402RequestId})`);
	  addLog(LogType.PROVIDER, `Adjunto: X402 Payment Request. Listo para el pago.`);
            await delay(2000);

	  // --- PASO 3: Orquestador y Mastercard (Mock) ---
            setCurrentStepIndex(2);
            addLog(LogType.CONSUMER, `➡️ ${LogType.ORCHESTRATOR}: Paga la X402_request_id=${x402RequestId}`);
            await delay(2000);
            addLog(LogType.ORCHESTRATOR, `➡️ ${LogType.MASTERCARD}: Solicitar autorización para ${bsvAmount} BSV`);
            await delay(2000);
            addLog(LogType.MASTERCARD, `⬅️ ${LogType.ORCHESTRATOR}: Autorizado ${LogType.SUCCESS}`);
            await delay(2000);
            addLog(LogType.ORCHESTRATOR, `Autorización de pago con ${LogType.SUCCESS}. Pasando a liquidación BSV ...`);
            await delay(2000);

            // --- PASO 4: Pago en BSV (Datos REALES de la respuesta) ---
            setCurrentStepIndex(3);
            addLog(LogType.ORCHESTRATOR, `➡️ ${LogType.BSV_ADAPTER}: Enviando micropago de ${bsvAmount} BSV...`);
            await delay(2000);
            addLog(LogType.BSV_ADAPTER, `⬅️ ${LogType.ORCHESTRATOR}: Transacción enviada. txid=${txid}`);
            addLog(LogType.ORCHESTRATOR, `Detalles de pago recibidos (JSON): \n${JSON.stringify(data.payment, null, 2)}`); // Usamos ORCHESTRATOR
            await delay(1000);
            addLog(LogType.ORCHESTRATOR, `Pago liquidado. Generando X402 recibo ... `);
            addLog(LogType.ORCHESTRATOR, `⬅️ ${LogType.CONSUMER}: Pago confirmado. Aquí tienes el recibo.`);

            // --- PASO 5: El Proveedor Entrega el Servicio ---
            setCurrentStepIndex(4);
            addLog(LogType.CONSUMER, `➡️ ${LogType.PROVIDER}: Aquí tienes el recibo (${txid}), Ejecutando Servicio...`);
            await delay(2000);
            const serviceResult: string = data.result.message;
            addLog(LogType.PROVIDER, `Servicio validado y ejecutado. Resultado: "${serviceResult}"`);
            addLog(LogType.PROVIDER, `Detalles del Resultado (JSON): \n${JSON.stringify(data.result, null, 2)}`); // Usamos PROVIDER
            addLog(LogType.PROVIDER, `⬅️ ${LogType.CONSUMER}: Completando entrega del servicio ....`);

            // Manejo de la URL de acceso
            if (data.result.access_url) {
                addLog(LogType.SUCCESS, `Abriendo servicio en: ${data.result.access_url}`);
                window.open(data.result.access_url, "_blank", "noopener");
            }

            // --- Finalización ---
            await delay(500);
            setFinalResult(`${LogType.SUCCESS} Resultado Final: ${serviceResult}`);
            setCurrentStepIndex(5); // Marcar todos los pasos como completados

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido.';
            addLog(LogType.ERROR, `Ocurrió un error en la simulación: ${errorMessage}`);
            setFinalResult(`${LogType.ERROR} Resultado Final: Error en la transacción.`);
            setCurrentStepIndex(0); // Reinicia los pasos en caso de error
        } finally {
            setIsTransactionRunning(false);
        }
    };
    
    // ... (El resto del código JSX y estilos permanece inalterado)
    
    const stepStatuses: StepStatus[] = STEPS.map((_, index) => {
      if (index < currentStepIndex) return 'completed';
      if (index === currentStepIndex) return 'active';
        return 'pending';
    });

      const COLOR_PALETTE = {
          PRIMARY: 'bg-[#145DFC] hover:bg-[#E55BAE]', 
          PRIMARY_TEXT: 'text-[#FE67C7]',
          CARD_BACKGROUND: 'bg-gray-800', 
          ACCENT: 'text-[#DAD2FC]',
          ACCENT_BORDER: 'border-[#5F4EB1]',
      };
    return (
        <div className="min-h-screen bg-black text-gray-100 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto border-white">
                <header className="mb-8 border-b border-white pb-4">
                    <h1 className="text-4xl font-extrabold text-white mb-4">
                        <FadeInUp>
                            Hackathon Demo: Agency Transactions
                        </FadeInUp>
                    </h1>
                    <div className="mt-2 text-xl text-gray-300">
                        Click the button to have the consumer agent request a service from the provider agent, negotiate price 
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="font-mono text-[#FE67C7]">
                            (X402)
                            </span>
                            , pay via Mastercard + BSV (mock), and return the result.
                            <span className="text-gray-300">,</span>
                            <span className="font-mono text-red-400">
                                Mastercard
                            </span>
                            +
                            <span className="font-mono text-cyan-200">
                                BSV
                            </span>
                            (mock)
                            <span className="text-gray-300">, and return the result.</span>
                        </div>
                    </div>
                </header>

                <div className={`flex flex-col sm:flex-row items-center justify-between ${COLOR_PALETTE.CARD_BACKGROUND} p-6 rounded-2xl shadow-2xl mb-8`}>
                    <button
                        onClick={handleStartTransaction}
                        disabled={isTransactionRunning}
                        className={`flex items-center justify-center px-8 py-3 text-lg font-bold rounded-xl shadow-2xl transition-all duration-300 transform
                        ${isTransactionRunning
                            ? 'bg-gray-900 text-gray-400 cursor-not-allowed'
                            : `${COLOR_PALETTE.PRIMARY} text-white hover:scale-[1.02] active:scale-[0.98]`
                        }`}
                    >
                        {isTransactionRunning ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <span className="text-2xl mr-2">🚀</span>
                        )}
                        {isTransactionRunning ? 'Transacción en Curso...' : 'Call Provider Service'}
                    </button>

                    <div className="mt-4 sm:mt-0 sm:ml-6 text-right">
                        <h3 className="text-sm font-medium text-gray-400">Estado de la Transacción</h3>
                        <p className={`text-lg font-semibold ${finalResult.startsWith(LogType.SUCCESS) ? 'text-green-400' : finalResult.startsWith(LogType.ERROR) ? 'text-red-400' : 'text-gray-300'}`}>
                            {finalResult}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className={`lg:col-span-1 ${COLOR_PALETTE.CARD_BACKGROUND} p-6 rounded-2xl shadow-xl`}> 
                        <h2 className="text-xl font-bold mb-4 text-[#FFFFFE] border-b border-gray-700 pb-2"> 
                            Flujo de Transacción
                        </h2>
                        <div className="space-y-4">
                            {STEPS.map((step, index) => (
                                <TimeLineStep
                                key={index}
                                title={step}
                                status={stepStatuses[index]}
                                stepIndex={index}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={`lg:col-span-2 ${COLOR_PALETTE.CARD_BACKGROUND} p-6 rounded-2xl shadow-xl`}> 
                        <h2 className="text-xl font-bold mb-4 text-[#FE67C7] border-b border-gray-700 pb-2"> 
                            Logs Console
                        </h2>
                        <div className="h-96 overflow-y-auto font-mono text-sm black p-4 rounded-lg border border-gray-700">
                            {logs.length === 0 ? (
                                <p className="text-gray-500 italic">Presiona "Call Provider Service" para ver el flujo de mensajes de transacción ...</p>
                            ) : (
                                logs.map((log, index) => (
                                    <div key={index} className={`flex space-x-2 border-b border-gray-800 last:border-b-0 py-1`}>
                                        <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
                                        <span
                                            className={`font-semibold shrink-0 ${
                                                log.sender === LogType.SUCCESS ? 'text-green-500' :
                                                log.sender === LogType.ERROR ? 'text-red-500' :
                                                'text-[#FE67C7]'
                                            }`}
                                        >
                                            {log.sender}:
                                        </span>
                                        <span className="text-gray-200 break-all whitespace-pre-wrap">{log.message}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;