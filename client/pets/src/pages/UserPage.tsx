import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {Alert, Modal, Form, ButtonGroup, Button, Spinner} from "react-bootstrap";
import {
    FaHistory,
    FaStar,
    FaUserCog,
    FaLanguage,
    FaSignOutAlt,
    FaWallet
} from 'react-icons/fa';
import ButtonComponent from "../components/Button/Button.tsx";
import {toast, ToastContainer} from "react-toastify";
import { useTranslation } from 'react-i18next';
import {LanguageContext} from "../context/LanguageContext.tsx";

interface LanguageContextProps {
    language: string;
    setLanguage: (language: string) => void;
}

const UserPage: React.FC = () => {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setLanguage(lng);
    };

    const name = authContext?.user?.name;
    const preferredLanguage = authContext?.user?.preferredLanguage || 'en';
    const languageContext = useContext(LanguageContext);
    const { language, setLanguage } = languageContext as LanguageContextProps;
    useEffect(() => {
        if (preferredLanguage !== language) {
            setLanguage(preferredLanguage);
        }
    }, []);

    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        const response = await fetch('https://pet-ssq2.onrender.com/api/users/balance', {
            credentials: 'include'
        });
        const data = await response.json();
        setBalance(data.balance);
    };

    const handleLogout = async () => {
        const response = await fetch('https://pet-ssq2.onrender.com/api/users/logout', {
            credentials: 'include'
        });
        const data = await response.json();
        if (data.error) {
            setError(data.error);
        }
        else {
            if (authContext) {
                authContext.setUser(null);
            }
            navigate('/');
        }
    };

    const handleLanguageChange = async () => {
        setShowModal(false);
        toast.success(t('languageUpdated', { language: language === 'ar' ? t('arabic') : t('english') }), {
            position: toast.POSITION.BOTTOM_RIGHT,
            autoClose: 2000
        });
        const result = await fetch('https://pet-ssq2.onrender.com/api/users/language', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ language })
        });
        const data = await result.json();
        if (data.error) {
            setError(data.error);
        }
    };

    if (balance === null) {
        return <div style={{marginTop: 150}}>
            <p>{t('loading')} </p>
            <Spinner animation="grow"/>
        </div>
    }

    return (
        <div style={{marginTop: 100, direction: language === 'ar' ? 'rtl' : 'ltr'}}>
            <ToastContainer/>
            {error && <Alert variant="danger">{error}</Alert>}
            <h1 style={{marginTop: 100}}>{t('name')}: {name}</h1>
            <h3 style={{color: '#1dce3d'}}><FaWallet style={{marginBottom: 4}} /> {t('balance')}: {balance}</h3>
            <ButtonGroup style={{ margin: "20px" }}
                         vertical size="sm">
                <Button className={`account-settings-btn ${language === 'ar' ? 'arabic' : ''}`} href="/user/orders" style={{color: "black"}}>
                    <FaHistory/> {t('ordersHistory')}
                </Button>
                <Button className={`account-settings-btn ${language === 'ar' ? 'arabic' : ''}`} href="/shop/favorites" style={{color: "black"}}>
                    <FaStar /> {t('favorites')}
                </Button>
                <Button className={`account-settings-btn ${language === 'ar' ? 'arabic' : ''}`} href="/user/settings" style={{color: "black"}}>
                    <FaUserCog /> {t('accountSettings')}
                </Button>
                <Button onClick={() => setShowModal(true)} className={`account-settings-btn ${language === 'ar' ? 'arabic' : ''}`} style={{color: "black"}}>
                    <FaLanguage /> {t('language')}
                </Button>
                <Modal show={showModal} onHide={() => setShowModal(false)} centered className="language-modal">
                    <Modal.Header closeButton onClick={() => changeLanguage(language === 'en' ? 'ar' : 'en')}>
                        <Modal.Title>{t('changeLanguage')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Check
                            type="radio"
                            id="english"
                            label={t('english')}
                            checked={language === 'en'}
                            onChange={() => changeLanguage('en')}
                        />
                        <Form.Check
                            type="radio"
                            id="arabic"
                            label={t('arabic')}
                            checked={language === 'ar'}
                            onChange={() => changeLanguage('ar')}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <ButtonComponent onClick={handleLanguageChange}>{t('updateLanguage')}</ButtonComponent>
                    </Modal.Footer>
                </Modal>
                <Button onClick={handleLogout} className={`account-settings-btn ${language === 'ar' ? 'arabic' : ''}`} style={{color: "black"}}>
                    <FaSignOutAlt /> {t('logout')}
                </Button>
            </ButtonGroup>
        </div>
    );
};

export default UserPage;