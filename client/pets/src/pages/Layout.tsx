import React, {useEffect, useState} from 'react';
import NavbarComponent from "../components/Navbar/Navbar.tsx";
import {Outlet} from "react-router-dom";
import Container from "react-bootstrap/Container";
import { QueryClient, QueryClientProvider } from 'react-query';
import {LanguageContext} from "../context/LanguageContext.tsx";
import { useTranslation } from 'react-i18next';
import ChatModal from "../components/ChatModal/ChatModal.tsx";

const queryClient = new QueryClient();

const Layout: React.FC = () => {
    const [language, setLanguage] = useState(localStorage.getItem('i18nextLng') || 'en');
    const { t } = useTranslation();

    useEffect(() => {
        const newLanguage = localStorage.getItem('i18nextLng') || 'en';
        if (newLanguage !== language) {
            setLanguage(newLanguage);
        }
    }, []);
    return (
        <Container className='bg-blue-50 min-h-screen flex flex-col justify-between' style={{direction: language === 'ar' ? 'rtl' : 'ltr'}}>
            <NavbarComponent
                brand={{href: "/", label: t("brand"), logo: "/logo.png"}}
                links={[
                    {href: "/", label: t("home")},
                ]}
                dropdown={[
                    {
                        title: t("cats").toUpperCase(),
                        items: [
                            {href: "/shop?category=cats", label: t("all")},
                            {href: "/shop?category=cats&subCategory=food", label: t("catFood")},
                            {href: "/shop?category=cats&subCategory=accessories", label: t("catAccessories")},
                        ],
                    },
                    {
                        title: t("dogs").toUpperCase(),
                        items: [
                            {href: "/shop?category=dogs", label: t("all")},
                            {href: "/shop?category=dogs&subCategory=food", label: t("dogFood")},
                            {href: "/shop?category=dogs&subCategory=accessories", label: t("dogAccessories")},
                        ],
                    }
                ]}
            />
            <LanguageContext.Provider value={{ language, setLanguage }}>
                <QueryClientProvider client={queryClient}>
                    <Outlet />
                </QueryClientProvider>
            </LanguageContext.Provider>
        </Container>
    );
};

export default Layout;