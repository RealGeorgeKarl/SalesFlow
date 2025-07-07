import React, { createContext, useContext, ReactNode } from 'react';
import { Persona } from '../types';

interface PersonaContextType {
  availablePersonas: Persona[];
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export const usePersona = () => {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
};

interface PersonaProviderProps {
  children: ReactNode;
}

export const PersonaProvider: React.FC<PersonaProviderProps> = ({ children }) => {
  // Hardcoded personas - no dynamic loading
  const availablePersonas: Persona[] = [
    {
      name: 'Admin',
      user_type: 'Admin'
    },
    {
      name: 'Salesperson',
      user_type: 'Salesperson'
    }
  ];

  const value: PersonaContextType = {
    availablePersonas,
  };

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
};