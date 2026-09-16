import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  Camera,
  Link as LinkIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Sparkles,
  Music,
  User,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotoURL?: string;
  displayName: string;
  onSavePhoto: (photoURL: string | null) => Promise<void>;
}

// Preset musical avatars for students/teachers who prefer academic icons
const PRESET_AVATARS = [
  {
    id: 'piano',
    name: 'Piano & Teclados',
    icon: '🎹',
    bg: 'from-amber-600 to-amber-900',
    color: '#D97706',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="40" fill="%231c1917"/><text x="100" y="125" font-size="90" text-anchor="middle">🎹</text></svg>',
  },
  {
    id: 'violin',
    name: 'Cuerdas Clásicas',
    icon: '🎻',
    bg: 'from-amber-700 to-stone-900',
    color: '#B45309',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="40" fill="%231c1917"/><text x="100" y="125" font-size="90" text-anchor="middle">🎻</text></svg>',
  },
  {
    id: 'vocal',
    name: 'Canto & Voz',
    icon: '🎤',
    bg: 'from-emerald-700 to-stone-900',
    color: '#059669',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="40" fill="%231c1917"/><text x="100" y="125" font-size="90" text-anchor="middle">🎤</text></svg>',
  },
  {
    id: 'guitar',
    name: 'Guitarra Acústica',
    icon: '🎸',
    bg: 'from-orange-700 to-stone-900',
    color: '#C2410C',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="40" fill="%231c1917"/><text x="100" y="125" font-size="90" text-anchor="middle">🎸</text></svg>',
  },
  {
    id: 'drums',
    name: 'Percusión & Ritmo',
    icon: '🥁',
    bg: 'from-stone-700 to-stone-950',
    color: '#44403C',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="40" fill="%231c1917"/><text x="100" y="125" font-size="90" text-anchor="middle">🥁</text></svg>',
  },
  {
    id: 'brass',
    name: 'Viento Metal',
    icon: '🎺',
    bg: 'from-yellow-600 to-amber-950',
    color: '#CA8A04',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="40" fill="%231c1917"/><text x="100" y="125" font-size="90" text-anchor="middle">🎺</text></svg>',
  },
];

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  currentPhotoURL,
  displayName,
  onSavePhoto,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(currentPhotoURL || null);
  const [originalFileSize, setOriginalFileSize] = useState<string | null>(null);
  const [optimizedFileSize, setOptimizedFileSize] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [urlTesting, setUrlTesting] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Client-side image processing: center crop + downscale to 320x320 px + compress to WebP/JPEG
  const processImageFile = (file: File) => {
    setErrorMsg(null);
    setUrlError(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP o GIF).');
      return;
    }

    // Max raw size 12MB
    if (file.size > 12 * 1024 * 1024) {
      setErrorMsg('La imagen seleccionada supera el límite máximo de 12 MB.');
      return;
    }

    const origKb = (file.size / 1024).toFixed(1);
    setOriginalFileSize(`${origKb} KB ${file.size > 1024 * 1024 ? `(${(file.size / (1024 * 1024)).toFixed(2)} MB)` : ''}`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const targetSize = 320; // 320x320 is super crisp for retina mobile & desktop
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            setPreviewPhoto(result);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Apply rotation if needed
          ctx.translate(targetSize / 2, targetSize / 2);
          if (rotationDegrees !== 0) {
            ctx.rotate((rotationDegrees * Math.PI) / 180);
          }

          // Calculate center crop
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.drawImage(
            img,
            sx,
            sy,
            minDim,
            minDim,
            -targetSize / 2,
            -targetSize / 2,
            targetSize,
            targetSize
          );

          // Try WebP first, fallback to JPEG
          let optimizedDataUrl = canvas.toDataURL('image/webp', 0.88);
          if (!optimizedDataUrl.startsWith('data:image/webp')) {
            optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          }

          const optBytes = Math.round((optimizedDataUrl.length * 3) / 4);
          const optKb = (optBytes / 1024).toFixed(1);
          setOptimizedFileSize(`${optKb} KB (320×320 px optimizado)`);
          setPreviewPhoto(optimizedDataUrl);
        } catch (procErr: any) {
          console.warn('Canvas optimization fallback:', procErr);
          setPreviewPhoto(result);
        }
      };
      img.onerror = () => {
        setErrorMsg('No se pudo decodificar la imagen seleccionada.');
      };
      img.src = result;
    };

    reader.onerror = () => {
      setErrorMsg('Error al leer el archivo desde el dispositivo.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = () => {
    setUrlError(null);
    setErrorMsg(null);
    const trimmed = urlInput.trim();

    if (!trimmed) {
      setUrlError('Ingresa un enlace de imagen válido.');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:')) {
      setUrlError('La URL debe comenzar con https://');
      return;
    }

    setUrlTesting(true);
    const testImg = new Image();
    testImg.onload = () => {
      setUrlTesting(false);
      setPreviewPhoto(trimmed);
      setOriginalFileSize(null);
      setOptimizedFileSize('Enlace Web Externo Verificado');
    };
    testImg.onerror = () => {
      setUrlTesting(false);
      setUrlError('No se pudo cargar la imagen desde este enlace. Asegúrate de que sea un enlace público directo a una imagen.');
    };
    testImg.src = trimmed;
  };

  const handleRotate = () => {
    if (!previewPhoto) return;
    const newRot = (rotationDegrees + 90) % 360;
    setRotationDegrees(newRot);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 320;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.translate(160, 160);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -160, -160, 320, 320);
      const rotated = canvas.toDataURL('image/webp', 0.88);
      setPreviewPhoto(rotated);
    };
    img.src = previewPhoto;
  };

  const handleClearPhoto = () => {
    setPreviewPhoto(null);
    setOriginalFileSize(null);
    setOptimizedFileSize(null);
    setUrlInput('');
    setErrorMsg(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      await onSavePhoto(previewPhoto);
      onClose();
    } catch (err: any) {
      console.error('Error saving photo:', err);
      setErrorMsg(err.message || 'Error al guardar la foto de perfil. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Foto de Perfil Personal
              </h3>
              <p className="text-xs text-stone-500">
                Academia Musical Judá • Credencial de Estudiante y Docente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Visual Preview Banner */}
          <div className="bg-stone-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center gap-5 shadow-inner">
            <div className="relative group shrink-0">
              {previewPhoto ? (
                <img
                  src={previewPhoto}
                  alt={displayName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-3 border-amber-400 object-cover shadow-lg bg-stone-950"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-stone-800 border-3 border-stone-600 text-amber-300 font-serif font-bold text-3xl flex items-center justify-center shadow-lg">
                  {(displayName || 'U').charAt(0).toUpperCase()}
                </div>
              )}

              {previewPhoto && (
                <button
                  type="button"
                  onClick={handleRotate}
                  title="Rotar imagen 90°"
                  className="absolute bottom-0 right-0 p-2 bg-stone-800 hover:bg-amber-600 text-white rounded-full border border-stone-600 shadow-md transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <span className="text-[11px] font-mono tracking-wider uppercase text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                Vista Previa en Vivo
              </span>
              <h4 className="font-serif text-lg font-bold text-white leading-snug">
                {displayName || 'Usuario de la Academia'}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Así aparecerá tu foto en las listas de clase, Google Meet sincronizado y foros académicos.
              </p>

              {optimizedFileSize && (
                <p className="text-[11px] font-mono text-emerald-400 pt-1 flex items-center gap-1 justify-center sm:justify-start">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{optimizedFileSize}</span>
                </p>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-stone-200">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-amber-600 text-amber-900 bg-amber-50/50'
                  : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Cargar Archivo</span>
            </button>

            <button
              onClick={() => setActiveTab('url')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'url'
                  ? 'border-amber-600 text-amber-900 bg-amber-50/50'
                  : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>Enlace Web (URL)</span>
            </button>

            <button
              onClick={() => setActiveTab('presets')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'presets'
                  ? 'border-amber-600 text-amber-900 bg-amber-50/50'
                  : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Emblemas Musicales</span>
            </button>
          </div>

          {/* Tab 1: Manual File Upload (Drag & Drop + Input) */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-amber-500 bg-amber-50/70 scale-[1.01]'
                    : 'border-stone-300 hover:border-amber-500 hover:bg-stone-50'
                }`}
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-100/60 text-amber-700 flex items-center justify-center">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h5 className="font-semibold text-sm text-stone-900 mb-1">
                  Haz clic para examinar o arrastra tu foto aquí
                </h5>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Formatos compatibles: JPG, PNG, WEBP, GIF. La imagen será adaptada y optimizada automáticamente a proporción cuadrada 1:1.
                </p>
                {originalFileSize && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-xs text-stone-700">
                    <span>Archivo original:</span>
                    <strong className="font-mono">{originalFileSize}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Web Image Link */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pega el enlace directo a tu imagen (HTTPS)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        setUrlError(null);
                      }}
                      placeholder="https://ejemplo.com/mi-foto.jpg"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    disabled={urlTesting || !urlInput.trim()}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {urlTesting ? 'Verificando...' : 'Aplicar'}
                  </button>
                </div>
                {urlError && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{urlError}</span>
                  </p>
                )}
              </div>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 leading-relaxed">
                Tip: Puedes usar fotos alojadas en Google Drive (enlace público de vista directa), GitHub, Imgur, Gravatar o tu propio servidor web.
              </div>
            </div>
          )}

          {/* Tab 3: AMJ Musical Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-600">
                Selecciona un emblema instrumental oficial de la Academia Musical Judá para tu perfil:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setPreviewPhoto(preset.dataUrl);
                      setOptimizedFileSize(`Emblema: ${preset.name}`);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      previewPhoto === preset.dataUrl
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20'
                        : 'border-stone-200 hover:border-amber-300 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{preset.icon}</span>
                    <div className="truncate">
                      <p className="font-semibold text-xs text-stone-900 truncate">
                        {preset.name}
                      </p>
                      <span className="text-[10px] text-stone-500">Judá Cátedra</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Remove Photo Action */}
          {previewPhoto && (
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                ¿Prefieres volver al monograma con tus iniciales?
              </span>
              <button
                type="button"
                onClick={handleClearPhoto}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Restaurar a iniciales</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-400 font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar Foto de Perfil</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
