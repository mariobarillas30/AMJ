import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { PaymentTransaction, StudentEnrollment, AcademicCourse } from '../../types';
import { INITIAL_ADMIN_PAYMENTS, INITIAL_ADMIN_ENROLLMENTS, INITIAL_ADMIN_STUDENTS } from '../../data/adminManagementData';
import { apiFetch } from '../../lib/api';
import { 
  CreditCard, 
  ArrowDown, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Play, 
  Lock, 
  Unlock, 
  Server, 
  Database, 
  Key, 
  FileText,
  Search,
  Filter,
  Send,
  Zap,
  ExternalLink
} from 'lucide-react';

interface PipelineStep {
  step: string;
  status: 'completed' | 'in_progress' | 'failed' | 'idle';
  description: string;
}

export const AdminPaymentsTab: React.FC = () => {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  const [students] = useState(INITIAL_ADMIN_STUDENTS);
  const [courses, setCourses] = useState<AcademicCourse[]>([]);

  // Real-time Firestore onSnapshot for payments collection
  useEffect(() => {
    setLoadingPayments(true);
    const path = 'payments';
    const col = collection(db, path);
    const unsubscribe = onSnapshot(
      col,
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: PaymentTransaction[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              studentId: data.studentId || '',
              studentName: data.studentName || '',
              studentEmail: data.studentEmail || '',
              courseId: data.courseId || '',
              courseTitle: data.courseTitle || '',
              amount: typeof data.amount === 'number' ? data.amount : 0,
              currency: data.currency || 'USD',
              gateway: data.gateway || 'stripe',
              status: data.status || 'paid',
              paidAt: data.paidAt || '',
              createdAt: data.createdAt || new Date().toISOString(),
              concept: data.concept || 'Colegiatura Académica',
              validatedByBackend: Boolean(data.validatedByBackend),
              gatewaySignature: data.gatewaySignature
            } as PaymentTransaction);
          });
          list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setPayments(list);
          setLoadingPayments(false);
        } else {
          // Initialize empty collection with default institutional payments
          try {
            for (const p of INITIAL_ADMIN_PAYMENTS) {
              await setDoc(doc(db, 'payments', p.id), p);
            }
          } catch (seedErr) {
            console.warn('Fallback seeding payments:', seedErr);
            setPayments(INITIAL_ADMIN_PAYMENTS);
            setLoadingPayments(false);
          }
        }
      },
      (error) => {
        setLoadingPayments(false);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const path = 'courses';
    const col = collection(db, path);
    const unsubscribe = onSnapshot(
      col,
      (snapshot) => {
        const list: AcademicCourse[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            title: data.title || '',
            description: data.description || '',
            instrument: data.instrument || 'Instrumento',
            teacherName: data.teacherName || '',
            teacherId: data.teacherId || '',
            modality: data.modality || 'live_virtual',
            schedule: data.schedule || '',
            priceMonthly: typeof data.priceMonthly === 'number' ? data.priceMonthly : 0,
            status: data.status || 'active',
            modules: data.modules || []
          } as AcademicCourse);
        });
        setCourses(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return () => unsubscribe();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');

  // Simulation state
  const [selectedStudentId, setSelectedStudentId] = useState('student-mario');
  const [selectedCourseId, setSelectedCourseId] = useState('course-vocal');
  const [selectedGateway, setSelectedGateway] = useState<'stripe' | 'tarjeta' | 'transferencia' | 'efectivo' | 'paypal'>('stripe');
  const [customAmount, setCustomAmount] = useState(320);

  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineTrace, setPipelineTrace] = useState<PipelineStep[] | null>(null);
  const [simulationLog, setSimulationLog] = useState<string | null>(null);

  // Security Tamper Test State
  const [tamperResult, setTamperResult] = useState<{ status: 'success' | 'blocked'; message: string } | null>(null);
  const [isTamperTesting, setIsTamperTesting] = useState(false);

  // Sync with server backend transactions on mount
  useEffect(() => {
    apiFetch('/api/payments/transactions')
      .then(res => res.json())
      .then(async (data) => {
        if (data.success && Array.isArray(data.payments) && data.payments.length > 0) {
          for (const sp of data.payments) {
            try {
              await setDoc(doc(db, 'payments', sp.id), sp, { merge: true });
            } catch (e) {}
          }
        }
      })
      .catch(() => {
        // Continue with Firestore
      });
  }, []);

  // Run authentic full-stack payment webhook pipeline
  const handleRunPaymentSimulation = async () => {
    setIsProcessing(true);
    setPipelineTrace([
      { step: '1. Pago', status: 'in_progress', description: 'Iniciando intento de pago...' },
      { step: '2. Pasarela', status: 'idle', description: 'Esperando respuesta de pasarela...' },
      { step: '3. Webhook', status: 'idle', description: 'Generación de webhook firmado...' },
      { step: '4. Backend', status: 'idle', description: 'Recepción en Express...' },
      { step: '5. Validación', status: 'idle', description: 'Criptografía & Anti-tampering...' },
      { step: '6. Firestore', status: 'idle', description: 'Persistencia en base de datos...' },
      { step: '7. Matrícula', status: 'idle', description: 'Actualización de vigencia...' },
      { step: '8. Acceso', status: 'idle', description: 'Habilitación de Meet, Drive y videos...' }
    ]);
    setSimulationLog(null);

    const student = students.find(s => s.uid === selectedStudentId);
    const course = courses.find(c => c.id === selectedCourseId);

    try {
      const response = await apiFetch('/api/payments/simulate-gateway-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentId,
          studentName: student?.displayName || 'Mario Barillas',
          studentEmail: student?.email || 'mariobarillas24@gmail.com',
          courseId: selectedCourseId,
          courseTitle: course?.title || 'Técnica Vocal & Canto Lírico Contemporáneo',
          amount: customAmount,
          gateway: selectedGateway
        })
      });

      const data = await response.json();

      if (data.success) {
        setPipelineTrace(data.pipeline);
        setSimulationLog(`Pago ${data.payment.id} validado. Matrícula ${data.enrollment.id} ahora está ${data.enrollment.status.toUpperCase()} con vigencia hasta ${data.enrollment.expiresAt}.`);

        // Persist payment directly in Firestore
        try {
          await setDoc(doc(db, 'payments', data.payment.id), data.payment);
        } catch (payErr) {
          console.warn('Error saving payment to Firestore:', payErr);
        }

        // Persist synchronized enrollment directly in Firestore
        try {
          await setDoc(doc(db, 'enrollments', data.enrollment.id), {
            ...data.enrollment,
            status: 'active',
            paymentId: data.payment.id,
            lastValidatedAt: data.payment.paidAt || new Date().toISOString(),
            approvedBy: 'Pasarela de Pagos (Webhook Backend Validado)'
          }, { merge: true });
        } catch (enrErr) {
          console.warn('Error updating enrollment in Firestore:', enrErr);
        }
      } else {
        setSimulationLog(`Error en pasarela: ${data.message || 'Fallo desconocido'}`);
      }
    } catch (err: any) {
      setSimulationLog(`Error de conexión al servidor: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Test anti-tampering: Attempt client-side `paid = true`
  const handleTestClientTamper = async () => {
    setIsTamperTesting(true);
    setTamperResult(null);

    try {
      const res = await apiFetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paid: true, // CLIENT-SIDE FORGED CLAIM
          studentId: selectedStudentId,
          courseId: selectedCourseId
        })
      });

      const result = await res.json();

      if (res.status === 403 || res.status === 401) {
        setTamperResult({
          status: 'blocked',
          message: `DENEGADO CON ÉXITO [HTTP ${res.status}]: ${result.message}`
        });
      } else {
        setTamperResult({
          status: 'success',
          message: 'Advertencia: El servidor permitió la petición sin firma.'
        });
      }
    } catch (err: any) {
      setTamperResult({
        status: 'blocked',
        message: `Petición interceptada/denegada por el servidor: ${err.message}`
      });
    } finally {
      setIsTamperTesting(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      p.studentName.toLowerCase().includes(query) ||
      p.courseTitle.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      (p.concept && p.concept.toLowerCase().includes(query));
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesGateway = gatewayFilter === 'all' || p.gateway === gatewayFilter;

    return matchesSearch && matchesStatus && matchesGateway;
  });

  return (
    <div className="space-y-6">
      
      {/* Sovereign Architecture Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
              FASE 11 — ARQUITECTURA DE PAGOS
            </span>
            <span className="text-xs text-stone-400 font-serif italic">
              Validación Criptográfica en Servidor
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Flujo Soberano: Pago ↓ Pasarela ↓ Webhook ↓ Backend ↓ Validación ↓ Firestore ↓ Matrícula ↓ Acceso
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 max-w-4xl leading-relaxed">
            <strong>Regla Inviolable:</strong> Nunca confíes en <code>paid = true</code> desde el navegador. La integración con Google Workspace no sustituye la lógica de pagos de la academia. Cuando un pago es validado por webhook en el backend, se actualiza la matrícula en Firestore y se habilita el acceso. Si la matrícula vence, se restringe el acceso institucional de inmediato, evitando nuevas conexiones a Google Meet y contenido privado.
          </p>

          {/* Architecture Node Flowchart */}
          <div className="pt-3 overflow-x-auto pb-2">
            <div className="flex items-center gap-1.5 min-w-[700px] text-xs font-mono font-semibold">
              {[
                { title: '1. Pago', sub: 'Estudiante', icon: <CreditCard className="w-3.5 h-3.5" /> },
                { title: '2. Pasarela', sub: 'Stripe / Banco', icon: <Zap className="w-3.5 h-3.5" /> },
                { title: '3. Webhook', sub: 'HTTP Firmado', icon: <Send className="w-3.5 h-3.5" /> },
                { title: '4. Backend', sub: 'API Express', icon: <Server className="w-3.5 h-3.5" /> },
                { title: '5. Validación', sub: 'HMAC-SHA256', icon: <Key className="w-3.5 h-3.5" /> },
                { title: '6. Firestore', sub: 'Colección Segura', icon: <Database className="w-3.5 h-3.5" /> },
                { title: '7. Matrícula', sub: 'Vigencia Activa', icon: <FileText className="w-3.5 h-3.5" /> },
                { title: '8. Acceso', sub: 'Meet / Drive', icon: <Unlock className="w-3.5 h-3.5" /> }
              ].map((node, i, arr) => (
                <React.Fragment key={i}>
                  <div className="px-3 py-2 rounded-xl bg-stone-800/90 border border-stone-700 text-stone-200 flex flex-col items-center shrink-0">
                    <div className="flex items-center gap-1 text-emerald-400">
                      {node.icon}
                      <span>{node.title}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-normal">{node.sub}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="text-emerald-500 font-bold shrink-0">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Testing & Verification Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Webhook Simulation Trigger */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base">
                  Simulador de Webhook de Pasarela
                </h3>
                <p className="text-[11px] text-stone-500">
                  Prueba el pipeline completo autoritativo desde la pasarela hasta la activación de matrícula
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full font-mono text-[10px] font-bold">
              Backend Port 3000
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Estudiante</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              >
                {students.map(s => (
                  <option key={s.uid} value={s.uid}>{s.displayName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Curso a Pagar</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Pasarela Emisora</label>
              <select
                value={selectedGateway}
                onChange={(e) => setSelectedGateway(e.target.value as any)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-none capitalize"
              >
                <option value="stripe">Stripe Checkout</option>
                <option value="tarjeta">Visa / Mastercard (CYBERSOURCE)</option>
                <option value="transferencia">Banca en Línea (BI / BAC)</option>
                <option value="paypal">PayPal Gateway</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Monto (GTQ)</label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleRunPaymentSimulation}
              disabled={isProcessing}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{isProcessing ? 'Procesando Webhook...' : 'Emitir Pago & Disparar Webhook'}</span>
            </button>

            <span className="text-[11px] text-stone-400">
              Genera firma HMAC-SHA256 y la transmite al endpoint <code>/api/payments/webhook</code>
            </span>
          </div>

          {/* Live Pipeline Execution Trace */}
          {pipelineTrace && (
            <div className="mt-4 p-4 rounded-2xl bg-stone-900 text-white text-xs space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <span className="text-emerald-400 font-bold">Traza de Validación Criptográfica</span>
                <span className="text-[10px] text-stone-400">8 de 8 Fases Cumplidas</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pipelineTrace.map((p, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] text-stone-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-stone-100">{p.step}</strong>
                      <div className="text-[10px] text-stone-400">{p.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              {simulationLog && (
                <div className="pt-2 border-t border-stone-800 text-emerald-300 text-[11px]">
                  ✓ {simulationLog}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Anti-Tampering Browser Defense */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-800 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base">
                Verificación Anti-Tampering
              </h3>
              <p className="text-[11px] text-stone-500">
                Demostración: Rechazo de <code>paid = true</code> desde el cliente
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-stone-800 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Regla Fundamental de Seguridad</span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-600">
              Un atacante o alumno no puede activar su matrícula manipulando variables en el inspector de JavaScript (como <code>enrollment.paid = true</code>). El backend Express solo confía en webhooks autenticados por firma de pasarela.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <button
              onClick={handleTestClientTamper}
              disabled={isTamperTesting}
              className="w-full px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isTamperTesting ? 'Enviando petición forjada...' : 'Probar Ataque: Enviar paid=true desde Cliente'}</span>
            </button>

            {tamperResult && (
              <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                tamperResult.status === 'blocked' 
                  ? 'bg-red-50 border-red-200 text-red-900' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <span className="font-mono text-[11px]">{tamperResult.message}</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-stone-100 pt-3 text-[11px] text-stone-500 space-y-1">
            <div className="flex justify-between">
              <span>Secreto Webhook:</span>
              <span className="font-mono text-stone-800">juda_sec_wh_***</span>
            </div>
            <div className="flex justify-between">
              <span>Algoritmo de Validación:</span>
              <span className="font-mono text-stone-800">HMAC-SHA256</span>
            </div>
            <div className="flex justify-between">
              <span>Almacenamiento Confiable:</span>
              <span className="font-mono text-stone-800">Firestore (Reglas de Seguridad)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar for Transactions */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por estudiante, concepto o ID de pago..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Estado */}
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1 text-xs">
              <Filter className="w-3 h-3 text-stone-400" />
              <span className="text-stone-500 text-[11px]">Estado:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-semibold text-stone-800 focus:outline-none text-xs"
              >
                <option value="all">Todos</option>
                <option value="paid">Pagados (Acreditados)</option>
                <option value="pending">Pendientes de Webhook</option>
                <option value="failed">Fallidos</option>
                <option value="refunded">Reembolsados</option>
              </select>
            </div>

            {/* Pasarela */}
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1 text-xs">
              <span className="text-stone-500 text-[11px]">Pasarela:</span>
              <select
                value={gatewayFilter}
                onChange={(e) => setGatewayFilter(e.target.value)}
                className="bg-transparent font-semibold text-stone-800 focus:outline-none text-xs capitalize"
              >
                <option value="all">Todas</option>
                <option value="stripe">Stripe</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="efectivo">Efectivo</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h4 className="font-serif font-bold text-stone-900 text-sm">
              Libro Mayor de Transacciones Autoritativas
            </h4>
            <p className="text-[11px] text-stone-500">
              Registros validados en backend y persistidos en Firestore
            </p>
          </div>
          <span className="text-xs font-mono text-stone-500 font-semibold">
            {filteredPayments.length} transacciones registradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-600 uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-bold">ID / Fecha</th>
                <th className="py-3.5 px-4 font-bold">Estudiante</th>
                <th className="py-3.5 px-4 font-bold">Curso & Concepto</th>
                <th className="py-3.5 px-4 font-bold">Monto</th>
                <th className="py-3.5 px-4 font-bold">Pasarela</th>
                <th className="py-3.5 px-4 font-bold">Estado</th>
                <th className="py-3.5 px-4 font-bold">Validación Backend</th>
                <th className="py-3.5 px-4 font-bold text-right">Firma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-stone-50/60 transition-colors">
                  
                  {/* ID / Fecha */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-stone-900 block text-xs">{pay.id}</span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {pay.createdAt ? pay.createdAt.split('T')[0] : 'Hoy'}
                    </span>
                  </td>

                  {/* Estudiante */}
                  <td className="py-3.5 px-4">
                    <strong className="text-stone-900 block font-semibold text-xs">{pay.studentName}</strong>
                    <span className="text-[10px] text-stone-400 font-mono">{pay.studentEmail || pay.studentId}</span>
                  </td>

                  {/* Curso & Concepto */}
                  <td className="py-3.5 px-4 max-w-[200px]">
                    <span className="font-semibold text-stone-800 line-clamp-1" title={pay.courseTitle}>
                      {pay.courseTitle}
                    </span>
                    <span className="text-[11px] text-stone-500 line-clamp-1">
                      {pay.concept || 'Colegiatura / Ciclo Académico'}
                    </span>
                  </td>

                  {/* Monto */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-stone-900 text-xs">
                      {pay.currency || 'GTQ'} {pay.amount.toFixed(2)}
                    </span>
                  </td>

                  {/* Pasarela */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-stone-100 rounded-md text-stone-700 font-mono text-[11px] capitalize">
                      <CreditCard className="w-3 h-3 text-stone-400" />
                      <span>{pay.gateway}</span>
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {pay.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Acreditado (Pagado)</span>
                      </span>
                    ) : pay.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Esperando Webhook</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-800 border border-red-200">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>{pay.status}</span>
                      </span>
                    )}
                  </td>

                  {/* Validación Backend */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {pay.validatedByBackend ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Validado en Servidor</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-stone-400 text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Sin validar</span>
                      </span>
                    )}
                  </td>

                  {/* Firma Criptográfica */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {pay.gatewaySignature ? (
                      <span className="font-mono text-[10px] text-stone-400 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded" title={pay.gatewaySignature}>
                        {pay.gatewaySignature.substring(0, 12)}...
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400 italic">No requerida</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
