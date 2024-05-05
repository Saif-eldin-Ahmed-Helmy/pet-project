import React from 'react';

interface AuthContextProps {
    user: any;
    setUser: React.Dispatch<React.SetStateAction<any>>;
    preferredLanguage: string;
    setPreferredLanguage: React.Dispatch<React.SetStateAction<string>>;
}

export const AuthContext = React.createContext<AuthContextProps | undefined>(undefined);