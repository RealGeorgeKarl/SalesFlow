import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Persona, SmsAccountResponse } from '../types';

interface SettingsContextType {
  smsAccount: SmsAccountResponse | null;
  availablePersonas: Persona[];
  isLoadingSettings: boolean;
  settingsLoadError: string | null;
  loadSettings: (userId: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [smsAccount, setSmsAccount] = useState<SmsAccountResponse | null>(null);
  const [availablePersonas, setAvailablePersonas] = useState<Persona[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [settingsLoadError, setSettingsLoadError] = useState<string | null>(null);

  const loadSettings = useCallback(async (userId: string) => {
    setIsLoadingSettings(true);
    setSettingsLoadError(null);

    try {
      // Call Supabase RPC function to get SMS account data
      // p_subscription_id is hardcoded to 9 as per previous instructions.
      const { data, error } = await supabase.rpc('get_or_create_sms_account', {
        p_subscription_id: 9,
        p_user_id: userId
      });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const accountData: SmsAccountResponse = data[0];
        setSmsAccount(accountData);

        // Process sms_users for availablePersonas
        let personas: Persona[] = [];
        if (accountData.sms_users && accountData.sms_users.length > 0) {
          personas = accountData.sms_users.map(p => ({
            name: p.name,
            user_type: p.user_type === 'salesperson' ? 'Salesperson' : 'Admin' // Ensure correct type mapping
          }));
        }

        // Ensure an Admin persona is always available for management purposes
        const hasAdmin = personas.some(p => p.user_type === 'Admin');
        if (!hasAdmin) {
          personas.unshift({ name: 'Owner', user_type: 'Admin' });
        }
        setAvailablePersonas(personas);

      } else {
        // No data returned, fallback to default Admin persona
        setSmsAccount(null);
        setAvailablePersonas([{ name: 'Owner', user_type: 'Admin' }]);
      }

      setIsLoadingSettings(false);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setIsLoadingSettings(false);
      setSettingsLoadError('Failed to load settings. Please try again.');
      // Fallback: Add default Owner/Admin persona on error
      setAvailablePersonas([{ name: 'Owner', user_type: 'Admin' }]);
    }
  }, []);

  const value: SettingsContextType = {
    smsAccount,
    availablePersonas,
    isLoadingSettings,
    settingsLoadError,
    loadSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};