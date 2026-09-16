import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export interface CountryItem {
  code: string;
  country: string;
  flag: string;
  iso: string;
  placeholder: string;
}

export const COUNTRIES: CountryItem[] = [
  { code: '+503', country: 'El Salvador', flag: '🇸🇻', iso: 'SV', placeholder: '7757-3023' },
  { code: '+1', country: 'Estados Unidos / Canadá', flag: '🇺🇸', iso: 'US', placeholder: '555-123-4567' },
  { code: '+502', country: 'Guatemala', flag: '🇬🇹', iso: 'GT', placeholder: '5555-1234' },
  { code: '+504', country: 'Honduras', flag: '🇭🇳', iso: 'HN', placeholder: '9876-5432' },
  { code: '+505', country: 'Nicaragua', flag: '🇳🇮', iso: 'NI', placeholder: '8765-4321' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷', iso: 'CR', placeholder: '8765-4321' },
  { code: '+507', country: 'Panamá', flag: '🇵🇦', iso: 'PA', placeholder: '6123-4567' },
  { code: '+52', country: 'México', flag: '🇲🇽', iso: 'MX', placeholder: '55 1234 5678' },
  { code: '+34', country: 'España', flag: '🇪🇸', iso: 'ES', placeholder: '612 34 56 78' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴', iso: 'CO', placeholder: '300 123 4567' },
  { code: '+51', country: 'Perú', flag: '🇵🇪', iso: 'PE', placeholder: '987 654 321' },
  { code: '+56', country: 'Chile', flag: '🇨🇱', iso: 'CL', placeholder: '9 1234 5678' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', iso: 'AR', placeholder: '11 2345-6789' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨', iso: 'EC', placeholder: '099 123 4567' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴', iso: 'BO', placeholder: '71234567' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪', iso: 'VE', placeholder: '412 1234567' },
  { code: '+501', country: 'Belice', flag: '🇧🇿', iso: 'BZ', placeholder: '622-1234' },
  { code: '+1', country: 'República Dominicana', flag: '🇩🇴', iso: 'DO', placeholder: '809-555-1234' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾', iso: 'UY', placeholder: '099 123 456' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾', iso: 'PY', placeholder: '0981 123456' },
  { code: '+55', country: 'Brasil', flag: '🇧🇷', iso: 'BR', placeholder: '11 91234-5678' },
  { code: '+39', country: 'Italia', flag: '🇮🇹', iso: 'IT', placeholder: '320 123 4567' },
  { code: '+44', country: 'Reino Unido', flag: '🇬🇧', iso: 'GB', placeholder: '7911 123456' },
  { code: '+49', country: 'Alemania', flag: '🇩🇪', iso: 'DE', placeholder: '151 23456789' },
  { code: '+33', country: 'Francia', flag: '🇫🇷', iso: 'FR', placeholder: '06 12 34 56 78' },
];

interface InternationalPhoneInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  theme?: 'light' | 'dark';
  placeholder?: string;
  className?: string;
}

export const InternationalPhoneInput: React.FC<InternationalPhoneInputProps> = ({
  id,
  value,
  onChange,
  required = false,
  disabled = false,
  theme = 'light',
  placeholder,
  className = '',
}) => {
  // Parse initial country and local number from value
  const parseValue = (val: string): { country: CountryItem; localNumber: string } => {
    if (!val) return { country: COUNTRIES[0], localNumber: '' };
    
    // Sort by code length desc so +503 matches before +5
    const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
    for (const c of sorted) {
      if (val.startsWith(c.code)) {
        const rest = val.slice(c.code.length).trim();
        return { country: c, localNumber: rest };
      }
    }
    return { country: COUNTRIES[0], localNumber: val.trim() };
  };

  const initial = parseValue(value);
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(initial.country);
  const [localNumber, setLocalNumber] = useState<string>(initial.localNumber);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes if needed
  useEffect(() => {
    const parsed = parseValue(value);
    setSelectedCountry(parsed.country);
    setLocalNumber(parsed.localNumber);
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelectCountry = (country: CountryItem) => {
    setSelectedCountry(country);
    setIsOpen(false);
    const combined = localNumber.trim() ? `${country.code} ${localNumber.trim()}` : country.code;
    onChange(combined);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setLocalNumber(text);
    const combined = text.trim() ? `${selectedCountry.code} ${text.trim()}` : '';
    onChange(combined);
  };

  const filteredCountries = COUNTRIES.filter(c => 
    c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.includes(searchQuery) ||
    c.iso.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isDark = theme === 'dark';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex rounded-xl overflow-hidden shadow-2xs">
        {/* Country Code Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold shrink-0 transition-colors border-r ${
            isDark
              ? 'bg-stone-800 text-stone-200 hover:bg-stone-750 border-stone-700'
              : 'bg-stone-50 text-stone-800 hover:bg-stone-100 border-stone-300'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          title={`Código de país: ${selectedCountry.country} (${selectedCountry.code})`}
        >
          <span className="text-base leading-none" role="img" aria-label={selectedCountry.country}>
            {selectedCountry.flag}
          </span>
          <span className="font-mono text-[11px] font-bold">
            {selectedCountry.code}
          </span>
          <ChevronDown className="w-3 h-3 text-stone-400" />
        </button>

        {/* Local Number Input */}
        <input
          id={id}
          type="tel"
          required={required}
          disabled={disabled}
          value={localNumber}
          onChange={handleNumberChange}
          placeholder={placeholder || selectedCountry.placeholder}
          className={`w-full px-3.5 py-2.5 text-xs focus:outline-none transition-all ${
            isDark
              ? 'bg-stone-800/90 text-white placeholder-stone-500 focus:bg-stone-800 focus:ring-1 focus:ring-amber-400'
              : 'bg-white text-stone-900 placeholder-stone-400 focus:ring-1 focus:ring-amber-500'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
      </div>

      {/* Country Selector Dropdown */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 z-50 w-72 max-w-[90vw] rounded-xl shadow-2xl border overflow-hidden animate-fadeIn ${
            isDark
              ? 'bg-stone-900 border-stone-700 text-stone-200'
              : 'bg-white border-stone-200 text-stone-800'
          }`}
        >
          {/* Search box inside dropdown */}
          <div className={`p-2 border-b ${isDark ? 'border-stone-800 bg-stone-950/60' : 'border-stone-100 bg-stone-50'}`}>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar país o código (+503, El Salvador)..."
                className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none ${
                  isDark
                    ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500 focus:border-amber-400'
                    : 'bg-white border-stone-200 text-stone-900 placeholder-stone-400 focus:border-amber-500'
                }`}
              />
            </div>
          </div>

          {/* Countries list */}
          <div className="max-h-60 overflow-y-auto py-1 text-xs divide-y divide-stone-100/10">
            {filteredCountries.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-stone-400">
                No se encontró ningún país
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code && c.country === selectedCountry.country;
                return (
                  <button
                    key={`${c.iso}-${c.code}`}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                      isSelected
                        ? isDark ? 'bg-amber-500/20 text-amber-300 font-bold' : 'bg-amber-50 text-amber-900 font-bold'
                        : isDark ? 'hover:bg-stone-800/80 text-stone-200' : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0 leading-none">{c.flag}</span>
                      <span className="truncate text-xs">{c.country}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span className="font-mono text-[11px] text-stone-400 font-medium">{c.code}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
