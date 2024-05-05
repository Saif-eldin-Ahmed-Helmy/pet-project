import React from 'react';

interface LanguageContextProps {
    language: string;
    setLanguage: React.Dispatch<React.SetStateAction<string>>;
}

export const LanguageContext = React.createContext<LanguageContextProps | undefined>(undefined);