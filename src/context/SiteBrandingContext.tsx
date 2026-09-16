import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export interface SiteBrandingData {
  logoUrl: string;
  heroImageUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  schedulesPhotoUrl: string;
  facilityPhotos: string[];
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

const DEFAULT_BRANDING: SiteBrandingData = {
  logoUrl: '/logo-amj.png',
  heroImageUrl: 'https://images.unsplash.com/photo-1520523839898-5071270560a7?auto=format&fit=crop&w=1600&q=80',
  heroTitle: 'Aprende música desde cualquier lugar',
  heroSubtitle: 'Formación instrumental y vocal de alto nivel. Aprende con maestros concertistas mediante clases virtuales en vivo por Google Meet, modalidad presencial, online y cursos grabados.',
  schedulesPhotoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
  facilityPhotos: [
    'https://images.unsplash.com/photo-1520523839898-5071270560a7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80',
  ],
};

interface SiteBrandingContextType {
  branding: SiteBrandingData;
  updateBranding: (newBranding: Partial<SiteBrandingData>, updatedByEmail?: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  loading: boolean;
}

const SiteBrandingContext = createContext<SiteBrandingContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'amj_site_branding_v1';

export const SiteBrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<SiteBrandingData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_BRANDING, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_BRANDING;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to real-time changes from Firestore
    const docRef = doc(db, 'site_settings', 'branding');

    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as SiteBrandingData;
        const merged = { ...DEFAULT_BRANDING, ...data };
        setBranding(merged);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        } catch {
          // storage full
        }
      } else {
        // initialize default in Firestore
        setDoc(docRef, DEFAULT_BRANDING).catch(() => {});
      }
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateBranding = async (newBranding: Partial<SiteBrandingData>, updatedByEmail?: string) => {
    const updated: SiteBrandingData = {
      ...branding,
      ...newBranding,
      lastUpdatedBy: updatedByEmail || 'superadmin',
      lastUpdatedAt: new Date().toISOString(),
    };

    setBranding(updated);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    try {
      const docRef = doc(db, 'site_settings', 'branding');
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      console.warn('Could not sync site branding to Firestore:', err);
    }
  };

  const resetToDefaults = async () => {
    setBranding(DEFAULT_BRANDING);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_BRANDING));
    } catch {
      // ignore
    }
    try {
      const docRef = doc(db, 'site_settings', 'branding');
      await setDoc(docRef, DEFAULT_BRANDING);
    } catch (err) {
      console.warn('Could not reset site branding in Firestore:', err);
    }
  };

  return (
    <SiteBrandingContext.Provider value={{ branding, updateBranding, resetToDefaults, loading }}>
      {children}
    </SiteBrandingContext.Provider>
  );
};

export const useSiteBranding = () => {
  const context = useContext(SiteBrandingContext);
  if (!context) {
    throw new Error('useSiteBranding must be used within a SiteBrandingProvider');
  }
  return context;
};
