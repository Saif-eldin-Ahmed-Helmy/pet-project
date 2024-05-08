import { Outlet, Navigate } from 'react-router-dom'
import React, {useEffect, useState} from "react";
import {Spinner} from "react-bootstrap";
import {AuthContext} from "../context/AuthContext";
import {useTranslation} from "react-i18next";

interface ProtectedRouteProps {
    role?: string;
    navigateTo?: string;
    isAuth?: boolean;
    redirect?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role = 'user', navigateTo = '/user', isAuth = true, redirect = true }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [user, setUser] = useState<any>(null);
    const [preferredLanguage, setPreferredLanguage] = useState<string>('en');
    const {t} = useTranslation();
    const authContext = React.useContext(AuthContext);

    useEffect(() => {
        if (authContext && authContext.user) {
            setIsAuthenticated(authContext.user.isAuthenticated && (role != 'user' ? (authContext.user.role == 'admin' || authContext.user.role === role) : true));
            setUser(authContext.user);
            setPreferredLanguage(authContext.user.preferredLanguage);
            return;
        }
        const checkAuthentication = async () => {
            const response = await fetch('https://pet-ssq2.onrender.com/api/users/session', {
                credentials: 'include'
            });
            const data = await response.json();
            setIsAuthenticated(data.isAuthenticated && (role != 'user' ? (data.role == 'admin' || data.role === role) : true));
            setUser(data);
            setPreferredLanguage(data.preferredLanguage);
        };

        checkAuthentication();
    }, [role]);

    if (isAuthenticated === null) {
        return <div style={{marginTop: 150}}>
            <p>{t('loading')} </p>
            <Spinner animation="grow"/>
        </div>
    }
    return(
        (isAuth ? isAuthenticated : !isAuthenticated) || !redirect ?
            <AuthContext.Provider value={{ user, setUser, preferredLanguage, setPreferredLanguage }}>
                <Outlet/>
            </AuthContext.Provider>
            : <Navigate to={navigateTo}/>
    )
}

export default ProtectedRoute;