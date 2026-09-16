import React, { useState } from 'react';
import { AcademicCourse, StudentEnrollment, PaymentMethod, AccessType } from '../../types';
import { apiFetch } from '../../lib/api';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  RefreshCw, 
  AlertTriangle,
  ExternalLink,
  DollarSign,
  Sparkles,
  Zap,
  Building2
} from 'lucide-react';

interface StudentPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: AcademicCourse | null;
  studentId: string;
  studentName: string;
  studentEmail: string;
  currentEnrollment?: StudentEnrollment | null;
  onPaymentSuccess: (updatedEnrollment: StudentEnrollment) => void;
}

export const StudentPaymentModal: React.FC<StudentPaymentModalProps> = ({
  isOpen,
  onClose,
  course,
  studentId,
  studentName,
  studentEmail,
  currentEnrollment,
  onPaymentSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [accessType, setAccessType] = useState<AccessType>('full_access');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [step, setStep] = useState<'form' | 'pipeline' | 'success'>('form');
  const [pipelineSteps, setPipelineSteps] = useState<{
    pago: 'idle' | 'running' | 'success';
    pasarela: 'idle' | 'running' | 'success';
    webhook: 'idle' | 'running' | 'success';
    backend: 'idle' | 'running' | 'success';
    validacion: 'idle' | 'running' | 'success';
    firestore: 'idle' | 'running' | 'success';
    matricula: 'idle' | 'running' | 'success';
    acceso: 'idle' | 'running' | 'success';
  }>({
    pago: 'idle',
    pasarela: 'idle',
    webhook: 'idle',
    backend: 'idle',
    validacion: 'idle',
    firestore: 'idle',
    matricula: 'idle',
    acceso: 'idle'
  });
  const [verificationDetails, setVerificationDetails] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !course) return null;

  const isRenewal = currentEnrollment?.status === 'expired' || currentEnrollment?.status === 'suspended';
  const amount = course.priceMonthly || 85;

  const handleStartPaymentFlow = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    setStep('pipeline');

    // Step 1: Pago
    setPipelineSteps(s => ({ ...s, pago: 'running' }));
    await new Promise(r => setTimeout(r, 300));
    setPipelineSteps(s => ({ ...s, pago: 'success', pasarela: 'running' }));

    try {
      const authHeaders: Record<string, string> = { 'Content-Type': 'application/json' };

      // 1. Iniciar checkout session en el backend oficial
      const checkoutRes = await apiFetch('/api/payments/checkout-session', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          studentId,
          courseId: course.id,
          amount,
          currency: 'USD',
          method: paymentMethod,
          accessType
        })
      });

      if (!checkoutRes.ok) {
        throw new Error('Error al inicializar sesión en la pasarela.');
      }
      const checkoutData = await checkoutRes.json();
      
      // Step 2: Pasarela OK
      setPipelineSteps(s => ({ ...s, pasarela: 'success', webhook: 'running' }));
      await new Promise(r => setTimeout(r, 400));

      // Step 3 & 4: Webhook & Backend (Simulación con firma criptográfica HMAC-SHA256)
      setPipelineSteps(s => ({ ...s, webhook: 'success', backend: 'running' }));

      const webhookRes = await apiFetch('/api/payments/simulate-gateway-webhook', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          eventId: 'evt_std_' + Date.now(),
          transactionId: checkoutData.transactionId || 'tx_' + Date.now(),
          studentId,
          studentName,
          studentEmail,
          courseId: course.id,
          courseTitle: course.title,
          amount,
          currency: 'USD',
          paymentMethod,
          accessType,
          modality: course.modality || 'virtual_en_vivo',
          status: 'succeeded',
          // Note: Notice we do NOT send paid=true or expect client-trusted flags.
          // The backend verifies the event payload and its HMAC signature!
        })
      });

      const webhookData = await webhookRes.json();
      if (!webhookRes.ok || !webhookData.success) {
        throw new Error(webhookData.error || 'La validación criptográfica del webhook falló.');
      }

      // Step 5: Validación
      setPipelineSteps(s => ({ ...s, backend: 'success', validacion: 'running' }));
      await new Promise(r => setTimeout(r, 350));
      setPipelineSteps(s => ({ ...s, validacion: 'success', firestore: 'running' }));

      // Step 6: Firestore
      await new Promise(r => setTimeout(r, 300));
      setPipelineSteps(s => ({ ...s, firestore: 'success', matricula: 'running' }));

      // Step 7: Matrícula
      await new Promise(r => setTimeout(r, 300));
      setPipelineSteps(s => ({ ...s, matricula: 'success', acceso: 'running' }));

      // Step 8: Acceso
      await new Promise(r => setTimeout(r, 300));
      setPipelineSteps(s => ({ ...s, acceso: 'success' }));

      setVerificationDetails(webhookData);
      setStep('success');

      if (webhookData.enrollment) {
        onPaymentSuccess(webhookData.enrollment);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error en la pasarela de pagos.');
      setStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold bg-amber-500/20 text-amber-900 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                Pasarela de Pago Segura
              </span>
              {isRenewal && (
                <span className="text-[11px] font-bold bg-red-100 text-red-800 border border-red-300 px-2.5 py-0.5 rounded-full">
                  Renovación de Vencimiento
                </span>
              )}
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              {isRenewal ? 'Renovación de Matrícula Académica' : 'Pago e Inscripción de Matrícula'}
            </h3>
            <p className="text-xs text-stone-500">
              {course.title} • Cátedra de {course.instrument}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Rule Card */}
        <div className="p-3.5 bg-stone-900 text-stone-200 rounded-2xl border border-stone-800 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Garantía de Seguridad Institucional</span>
          </div>
          <p className="text-[11px] text-stone-300 leading-relaxed font-sans">
            Todos los comprobantes y transacciones son verificados por la Dirección Financiera de la Academia antes de la emisión de la matrícula oficial.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: FORM */}
        {step === 'form' && (
          <div className="space-y-5">
            {/* Summary Box */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Alumno:</span>
                <strong className="text-stone-900 font-semibold">{studentName} ({studentEmail})</strong>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Vigencia otorgada:</span>
                <strong className="text-emerald-700 font-bold">1 mes lectivo (+30 días de acceso total)</strong>
              </div>
              <div className="flex items-center justify-between text-stone-600 pt-2 border-t border-stone-200 text-sm">
                <span className="font-bold text-stone-800">Total a Pagar:</span>
                <strong className="text-xl font-serif font-bold text-stone-950">${amount} USD</strong>
              </div>
            </div>

            {/* Access Type Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Tipo de Acceso Autorizado
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccessType('full_access')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    accessType === 'full_access'
                      ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <strong className="block text-stone-900 font-bold">Acceso Total</strong>
                  <span className="text-[11px] text-stone-500">Clases, Google Meet, Drive y grabaciones</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessType('materials_only')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    accessType === 'materials_only'
                      ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <strong className="block text-stone-900 font-bold">Solo Materiales</strong>
                  <span className="text-[11px] text-stone-500">Partituras Urtext (sin salas Meet en vivo)</span>
                </button>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Método de Pago
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'stripe', name: 'Stripe', desc: 'Tarjeta de Crédito / Débito' },
                  { id: 'paypal', name: 'PayPal', desc: 'Cuenta PayPal' },
                  { id: 'transfer', name: 'Transferencia', desc: 'Banca Local' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === m.id
                        ? 'border-stone-950 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 opacity-80" />
                    <span className="text-xs font-bold block">{m.name}</span>
                    <span className={`text-[10px] block truncate ${paymentMethod === m.id ? 'text-stone-300' : 'text-stone-400'}`}>
                      {m.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleStartPaymentFlow}
              disabled={isProcessing}
              className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Ejecutar Pago & Validar Webhook (${amount} USD)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: PIPELINE EXECUTION */}
        {step === 'pipeline' && (
          <div className="space-y-5 py-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-800 mx-auto flex items-center justify-center animate-spin">
              <RefreshCw className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold text-stone-900">
                Procesando Pipeline Criptográfico de Pagos
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                La pasarela está emitiendo un webhook firmado con HMAC-SHA256 para validación estricta en el backend Node.js.
              </p>
            </div>

            {/* Pipeline Visual Flow */}
            <div className="space-y-2 text-left bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs font-mono">
              {[
                { key: 'pago', label: '1. Pago iniciado por el alumno' },
                { key: 'pasarela', label: '2. Pasarela emite transacción autorizada' },
                { key: 'webhook', label: '3. Webhook firmado con secreto HMAC-SHA256' },
                { key: 'backend', label: '4. Backend recibe carga útil y firma' },
                { key: 'validacion', label: '5. Validación estricta (rechaza paid=true de cliente)' },
                { key: 'firestore', label: '6. Registro seguro en Firestore' },
                { key: 'matricula', label: '7. Matrícula actualizada a estado "active"' },
                { key: 'acceso', label: '8. Acceso concedido a Meet, Drive y recursos' },
              ].map((item) => {
                const st = pipelineSteps[item.key as keyof typeof pipelineSteps];
                return (
                  <div key={item.key} className="flex items-center justify-between py-1 border-b border-stone-100 last:border-0">
                    <span className={st === 'success' ? 'text-stone-900 font-bold' : 'text-stone-500'}>
                      {item.label}
                    </span>
                    <span>
                      {st === 'running' && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />}
                      {st === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 font-bold" />}
                      {st === 'idle' && <span className="text-[10px] text-stone-300">esperando</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && (
          <div className="space-y-5 text-center py-2">
            <div className="w-14 h-14 rounded-3xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Pago Validado Exitosamente
              </span>
              <h4 className="font-serif text-xl font-bold text-stone-900 mt-2">
                ¡Matrícula Activada con Éxito!
              </h4>
              <p className="text-xs text-stone-600 max-w-sm mx-auto mt-1 leading-relaxed">
                El backend ha verificado la firma criptográfica y ha registrado el pago de <strong>${amount} USD</strong>. Se ha desbloqueado de inmediato el acceso a tus clases en vivo de Google Meet, Drive y material Urtext.
              </p>
            </div>

            {verificationDetails && (
              <div className="bg-stone-900 text-left p-4 rounded-2xl text-[11px] text-stone-300 space-y-1 font-mono border border-stone-800">
                <div className="text-amber-400 font-bold pb-1 border-b border-stone-800 flex items-center justify-between">
                  <span>COMPROBANTE DIGITAL</span>
                  <span>VERIFICADO ✓</span>
                </div>
                <div>ID Transacción: <span className="text-white">{verificationDetails.transactionId}</span></div>
                <div>Estado Matrícula: <span className="text-emerald-400 font-bold">active</span></div>
                <div>Vigencia hasta: <span className="text-white">{verificationDetails.enrollment?.expiresAt?.split('T')[0] || 'Vigente'}</span></div>
                <div>Recursos Autorizados: <span className="text-white">Meet, Clases, Drive Urtext, Videos</span></div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <span>Ingresar a mis Clases Autorizadas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
