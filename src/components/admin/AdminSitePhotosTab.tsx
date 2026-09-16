import React, { useState } from 'react';
import { useSiteBranding } from '../../context/SiteBrandingContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Image as ImageIcon, 
  Upload, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Building2, 
  Plus, 
  Trash2, 
  Eye, 
  Link as LinkIcon, 
  FileText,
  ShieldAlert,
  Save,
  Palette
} from 'lucide-react';

export const AdminSitePhotosTab: React.FC = () => {
  const { branding, updateBranding, resetToDefaults } = useSiteBranding();
  const { currentUser } = useAuth();

  const [logoUrl, setLogoUrl] = useState(branding.logoUrl);
  const [heroImageUrl, setHeroImageUrl] = useState(branding.heroImageUrl);
  const [heroTitle, setHeroTitle] = useState(branding.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(branding.heroSubtitle);
  const [schedulesPhotoUrl, setSchedulesPhotoUrl] = useState(branding.schedulesPhotoUrl);
  const [facilityPhotos, setFacilityPhotos] = useState<string[]>(branding.facilityPhotos || []);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(null);

  // Presets of high resolution music academy images
  const PRESET_HEROES = [
    {
      title: 'Piano de Cola & Concierto',
      url: 'https://images.unsplash.com/photo-1520523839898-5071270560a7?auto=format&fit=crop&w=1600&q=80',
    },
    {
      title: 'Aula de Cuerdas & Violines',
      url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
    },
    {
      title: 'Estudio de Grabación Profesional',
      url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80',
    },
    {
      title: 'Sala de Ensayo Orquestal',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
    },
  ];

  // Helper to read uploaded image file as data URL
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Por favor selecciona una imagen menor a 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSuccess(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateBranding(
        {
          logoUrl,
          heroImageUrl,
          heroTitle,
          heroSubtitle,
          schedulesPhotoUrl,
          facilityPhotos,
        },
        currentUser?.email || 'superadmin'
      );

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      alert('Error al guardar los cambios de imágenes de la página.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('¿Deseas restaurar todas las imágenes y textos del sitio a los valores predeterminados de la Academia?')) {
      await resetToDefaults();
      setLogoUrl('/logo-amj.png');
      setHeroImageUrl('https://images.unsplash.com/photo-1520523839898-5071270560a7?auto=format&fit=crop&w=1600&q=80');
      setHeroTitle('Aprende música desde cualquier lugar');
      setHeroSubtitle('Formación instrumental y vocal de alto nivel. Aprende con maestros concertistas mediante clases virtuales en vivo por Google Meet, modalidad presencial, online y cursos grabados.');
      setSchedulesPhotoUrl('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80');
      setFacilityPhotos([
        'https://images.unsplash.com/photo-1520523839898-5071270560a7?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80',
      ]);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleAddFacilityPhoto = (photoUrl: string) => {
    if (!photoUrl) return;
    setFacilityPhotos([...facilityPhotos, photoUrl]);
  };

  const handleRemoveFacilityPhoto = (index: number) => {
    setFacilityPhotos(facilityPhotos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Title & Save Bar */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4" />
            <span>Personalización General del Sitio</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Administración de Logo e Imágenes del Sitio
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl">
            Sube o cambia el logo oficial de la academia, la foto o banner de portada principal (Hero), las fotos de las instalaciones y portadas de secciones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restaurar Valores</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <span>Guardando...</span>
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-stone-950" />
                <span>¡Guardado Exitosamente!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: LOGO OFICIAL DE LA ACADEMIA */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-600" />
              <span>1. Logo Oficial de la Academia</span>
            </h3>
            <p className="text-xs text-stone-500">
              Se muestra en el encabezado, footer, modales de autenticación, portal de estudiantes y diplomas oficiales.
            </p>
          </div>
          <span className="text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-semibold">
            Formato recomendado: PNG transparente o SVG
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Logo Preview Card */}
          <div className="p-6 bg-stone-900 rounded-2xl border border-stone-800 text-center space-y-3 flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">
              Vista Previa Actual
            </span>
            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 shadow-xl">
              <img
                src={logoUrl || '/logo-amj.png'}
                alt="Logo Academia"
                className="w-28 h-28 object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo-amj.png';
                }}
              />
            </div>
            <span className="text-xs text-amber-400 font-serif italic">
              Academia Musical Judá
            </span>
          </div>

          {/* Upload Controls */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Subir nueva imagen de Logo desde la Computadora
              </label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2 shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>Examinar Archivo...</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, (dataUrl) => setLogoUrl(dataUrl))}
                  />
                </label>
                <span className="text-xs text-stone-500 italic">
                  Formatos soportados: PNG, JPG, WebP (Máx. 8MB)
                </span>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                O pegar enlace directo de la imagen (URL)
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://servidor.com/logo-oficial.png"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            {logoUrl !== '/logo-amj.png' && (
              <button
                type="button"
                onClick={() => setLogoUrl('/logo-amj.png')}
                className="text-xs text-stone-500 hover:text-amber-700 underline transition-colors flex items-center gap-1 cursor-pointer pt-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar logo predeterminado (/logo-amj.png)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: PORTADA PRINCIPAL / HERO BANNER */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>2. Banner / Imagen Principal de la Portada (Hero)</span>
            </h3>
            <p className="text-xs text-stone-500">
              Personaliza la foto de impacto principal y el encabezado en la pantalla de inicio del sitio web.
            </p>
          </div>
        </div>

        {/* Hero Banner Preview */}
        <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 text-white p-8 text-center space-y-4">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 blur-xs transition-all duration-300"
            style={{ backgroundImage: `url('${heroImageUrl}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 font-bold">
              VISTA PREVIA DEL ENCABEZADO
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              {heroTitle || 'Aprende música desde cualquier lugar'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {heroSubtitle || 'Formación instrumental y vocal de alto nivel.'}
            </p>
          </div>
        </div>

        {/* Form Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Título Principal de la Portada
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="Aprende música desde cualquier lugar"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Subtítulo / Descripción
              </label>
              <textarea
                rows={3}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="Descripción general de la propuesta académica..."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-700"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Subir Foto de Portada (Banner HD)
              </label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2 shrink-0">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Subir Imagen Hero...</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, (dataUrl) => setHeroImageUrl(dataUrl))}
                  />
                </label>
                <span className="text-xs text-stone-500">
                  Recomendado: 1920x1080px o superior.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                O pegar enlace de la foto (URL)
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Presets Gallery */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                O seleccionar una de nuestras fotos de alta definición:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_HEROES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setHeroImageUrl(preset.url);
                      setActivePresetIndex(idx);
                    }}
                    className={`relative rounded-xl overflow-hidden border text-left p-2 transition-all flex items-center gap-2 cursor-pointer ${
                      heroImageUrl === preset.url
                        ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-10 h-10 object-cover rounded-lg shrink-0"
                    />
                    <span className="text-[11px] font-medium text-stone-800 line-clamp-1">
                      {preset.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: GALERÍA DE INSTALACIONES Y SEDE ACADÉMICA */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              <span>3. Galería de Fotos de las Instalaciones & Sede</span>
            </h3>
            <p className="text-xs text-stone-500">
              Sonsonate, El Salvador • Fotos de las aulas de piano, concierto, cabinas de ensayo y eventos institucionales.
            </p>
          </div>

          <label className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0">
            <Plus className="w-4 h-4" />
            <span>Agregar Nueva Foto</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, (dataUrl) => handleAddFacilityPhoto(dataUrl))}
            />
          </label>
        </div>

        {facilityPhotos.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 text-stone-500 text-xs">
            No hay fotos agregadas en la galería de instalaciones. Haz clic en "Agregar Nueva Foto" para subir la primera.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {facilityPhotos.map((photo, index) => (
              <div
                key={index}
                className="relative group rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-xs hover:shadow-md transition-shadow"
              >
                <img
                  src={photo}
                  alt={`Instalación ${index + 1}`}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveFacilityPhoto(index)}
                    className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md transition-colors cursor-pointer"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-2 bg-white text-[11px] text-stone-600 font-mono text-center truncate border-t border-stone-100">
                  Foto Sede #{index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
