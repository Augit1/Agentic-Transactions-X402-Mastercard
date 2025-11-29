import React, { useState } from 'react';
import TimeLineStep from './TimeLineStep.tsx';
import {FadeInUp} from './TextAnimations.tsx'
import {
	type LogItem,
	type LogSender,
	type StepStatus,
	LogType,
	STEPS,
} from '../../types.tsx';

// Simular latencia, luego añadimos backend !
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// Componente principal que simula y visualiza el flujo de la transacción agéntica.
const AgentDashboard: React.FC = () => {
  	// Estado para la simulación
	const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
	const [logs, setLogs] = useState<LogItem[]>([]);
	const [isTransactionRunning, setIsTransactionRunning] = useState<boolean>(false);
	const [finalResult, setFinalResult] = useState<string>('Resultado: todavía no se ha ejecutado el servicio.');

	// Usar LogSender para el tipado del remitente
	const addLog = (sender: LogSender | '✅ Éxito' | '❌ Error', message: string): void => {
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


	// =================== "Hardcodeo de datos" ===================
	const transactionId = Math.random().toString(36).substring(2, 7).toUpperCase();
	const x402RequestId = 'X402-REQ-' + Math.floor(Math.random() * 900 + 100);
	const bsvAmount = '0.0001';
	let txid: string = '';

	try {
	  // --- PASO 1: Petición del Consumidor ---
	  setCurrentStepIndex(0);
	  addLog(LogType.CONSUMER, `➡️ ${LogType.PROVIDER}: Necesito el servicio digital _________`);
	  await delay(2000);

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
	  addLog(LogType.MASTERCARD, `⬅️ ${LogType.ORCHESTRATOR}: Autorizado ✅`);
	  await delay(2000);
	  addLog(LogType.ORCHESTRATOR, `Autorización de pago OK ✅. Pasando a liquidación BSV ...`);
	  await delay(2000);

	  // --- PASO 4: Pago en BSV (Simulado) ---
	  setCurrentStepIndex(3);
	  addLog(LogType.ORCHESTRATOR, `➡️ ${LogType.BSV_ADAPTER}: Enviando micropago de ${bsvAmount} BSV...`);
	  await delay(2000);
	  txid = 'txid-' + transactionId;
	  addLog(LogType.BSV_ADAPTER, `⬅️ ${LogType.ORCHESTRATOR}: Transacción enviada. txid=${txid}`);
	  await delay(2000);
	  addLog(LogType.ORCHESTRATOR, `Pago liquidado. Generando X402 recibo.`);
	  addLog(LogType.ORCHESTRATOR, `⬅️ ${LogType.CONSUMER}: Pago confirmado. Aquí tienes el recibo.`);
	  await delay(2000);

	  // --- PASO 5: El Proveedor Entrega el Servicio ---
	  setCurrentStepIndex(4);
	  addLog(LogType.CONSUMER, `➡️ ${LogType.PROVIDER}: Aquí tienes el recibo (${txid}), Ejecutando ...`);
	  await delay(2000);
	  const serviceResult: string = `Resultado="Hola, soy el agente proveedor. Aquí está el dato solicitado."`;
	  addLog(LogType.PROVIDER, `Servicio validado y ejecutado. Resultado: "${serviceResult}"`);
	  addLog(LogType.PROVIDER, `⬅️ ${LogType.CONSUMER}: Entrega del servicio completada.`);

	  // --- Finalización ---
	  await delay(500);
	  setFinalResult(`✅ Resultado Final: ${serviceResult}`);
	  setCurrentStepIndex(5); // Marcar todos los pasos como completados
	} catch (error) {
	  const errorMessage = error instanceof Error ? error.message : 'Error desconocido.';
	  addLog('❌ Error', `Ocurrió un error en la simulación: ${errorMessage}`);
	  setFinalResult('❌ Resultado Final: Error en la transacción.');
	  setCurrentStepIndex(0); // Reinicia los pasos en caso de error
	} finally {
	  setIsTransactionRunning(false);
	}
  };

  // Determinar el estado de cada paso para el Timeline
  const stepStatuses: StepStatus[] = STEPS.map((_, index) => {
	if (index < currentStepIndex) return 'completed';
	if (index === currentStepIndex) return 'active';
	return 'pending';
  });
// Defino la nueva paleta de colores para una mejor referencia y gestión
const COLOR_PALETTE = {
  // Principal: Rosa Fuerte
  PRIMARY: 'bg-[#145DFC] hover:bg-[#E55BAE]', 
  PRIMARY_TEXT: 'text-[#FE67C7]',
  // Secundario/Fondo de tarjeta (usando el morado oscuro para contraste con el fondo principal)
  CARD_BACKGROUND: 'bg-gray-800', 
  // Acentos (usando el morado brillante para títulos y borde)
  ACCENT: 'text-[#DAD2FC]',
  ACCENT_BORDER: 'border-[#5F4EB1]',
  // Botones/Acciones/Log: Azul/Verde se mapearán a los nuevos tonos morados si es necesario.
};

// **Nota:** El color del botón 'Iniciar Transacción' se ajusta a un tono vibrante de la paleta.

return (
    // 1. AJUSTE DE LAYOUT: bg-black para el fondo oscuro. 
    // p-4 sm:p-8 para padding y max-w-screen-xl para centrar y limitar el ancho.
    <div className="min-h-screen bg-black text-gray-100 p-4 sm:p-8">
      <div className="max-w-screen-xl mx-auto border-white"> {/* MODIFICADO: Límite de ancho para mejor legibilidad */}
        {/* Título y Contexto */}
        <header className="mb-8 border-b border-white pb-4">
		  


			<h1 className="text-4xl font-extrabold text-white mb-4">
				<FadeInUp>
					Hackathon Demo: Agency Transactions
				</FadeInUp>
			</h1>



          <div className="mt-2 text-xl text-gray-300">
              The Consumer Agent automatically pays the Provider Agent using
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Ajuste de colores de tecnología */}
              <span className="font-mono text-[#FE67C7]"> {/* X402 (Rosa Fuerte) */}
                X402
              </span>
              <span className="text-gray-300">,</span>
              <span className="font-mono text-red-400"> {/* Mastercard (Mantenemos Rojo) */}
                Mastercard (Simulated)
              </span>
              <span className="text-gray-300"> y </span>
              <span className="font-mono text-[#5F4EB1]"> {/* BSV (Morado Brillante) */}
                BSV
              </span>
                as a liquidation layer
            </div>
          </div>
        </header>

        {/* Botón Principal y Resultado */}
        <div className={`flex flex-col sm:flex-row items-center justify-between ${COLOR_PALETTE.CARD_BACKGROUND} p-6 rounded-2xl shadow-2xl mb-8`}> {/* MODIFICADO: Fondo de tarjeta y rounded-2xl */}
          <button
            onClick={handleStartTransaction}
            disabled={isTransactionRunning}
            className={`flex items-center justify-center px-8 py-3 text-lg font-bold rounded-xl shadow-2xl transition-all duration-300 transform
              ${isTransactionRunning
                ? 'bg-gray-900 text-gray-400 cursor-not-allowed'
                : `${COLOR_PALETTE.PRIMARY} text-white hover:scale-[1.02] active:scale-[0.98]` // MODIFICADO: Botón principal con Rosa Fuerte
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
            {isTransactionRunning ? 'Transacción en Curso...' : 'Iniciar Transacción Agente-a-Agente'}
          </button>

          <div className="mt-4 sm:mt-0 sm:ml-6 text-right">
            <h3 className="text-sm font-medium text-gray-400">Estado de la Transacción</h3>
            {/* Mantener colores semánticos (verde/rojo) para el resultado */}
            <p className={`text-lg font-semibold ${finalResult.startsWith('✅') ? 'text-green-400' : finalResult.startsWith('❌') ? 'text-red-400' : 'text-gray-300'}`}>
              {finalResult}
            </p>
          </div>
        </div>

        {/* Contenido Principal: Pasos y Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna 1: Zona de Pasos (Timeline) */}
          <div className={`lg:col-span-1 ${COLOR_PALETTE.CARD_BACKGROUND} p-6 rounded-2xl shadow-xl`}> {/* MODIFICADO: Fondo de tarjeta y rounded-2xl */}
            <h2 className="text-xl font-bold mb-4 text-[#FFFFFE] border-b border-gray-700 pb-2"> {/* MODIFICADO: Título con Morado Brillante */}
                Flujo de Transacción (Modo Humano)
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

          {/* Columna 2: Zona de Logs / Conversación Técnica */}
          <div className={`lg:col-span-2 ${COLOR_PALETTE.CARD_BACKGROUND} p-6 rounded-2xl shadow-xl`}> {/* MODIFICADO: Fondo de tarjeta y rounded-2xl */}
            <h2 className="text-xl font-bold mb-4 text-[#FE67C7] border-b border-gray-700 pb-2"> {/* MODIFICADO: Título con Rosa Fuerte */}
                Consola de Logs
            </h2>
            <div className="h-96 overflow-y-auto font-mono text-sm black p-4 rounded-lg border border-gray-700">
              {logs.length === 0 ? (
                <p className="text-gray-500 italic">Presiona "Iniciar Transacción" para ver el flujo de mensajes...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex space-x-2 border-b border-gray-800 last:border-b-0 py-1">
                    <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
                    <span
                      className={`font-semibold shrink-0 ${
                        // Mantenemos colores semánticos, pero ajustamos el color por defecto (log.sender)
                        log.sender === LogType.SUCCESS ? 'text-green-500' :
                        log.sender === LogType.ERROR ? 'text-red-500' :
                        'text-[#FE67C7]' // MODIFICADO: Log general con Rosa Fuerte
                      }`}
                    >
                      {log.sender}:
                    </span>
                    <span className="text-gray-200 break-all">{log.message}</span>
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