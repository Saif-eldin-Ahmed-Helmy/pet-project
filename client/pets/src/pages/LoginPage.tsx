import React, { useState } from 'react';
import {Form, Button, Alert} from 'react-bootstrap';
import ButtonComponent from "../components/Button/Button.tsx";
import {useNavigate} from "react-router-dom";
import { useTranslation } from 'react-i18next';

const LoginPage: React.FC = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false); // Add this line
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);

        if (!email || !password || password.length < 8 || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
            return;
        }

        const response = await fetch(`http://localhost:3001/api/users?email=${email}&password=${password}`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.error) {
            setError(data.error);
        } else {
            navigate('/');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:3001/api/users/google';
    };

    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh'}}>
            <Form style={{width: '50%'}} onSubmit={handleLogin}>
                {error && <Alert variant="danger">{error}</Alert>}
                <Button variant="primary" onClick={handleGoogleLogin} style={{marginBottom: 20, color:'black', backgroundColor: '#f5f5f5', borderColor: 'black', fontFamily: "sans-serif", fontWeight: 5000}}>
                    <img src="/google_logo.webp" alt="Google logo" style={{width: '20px', marginRight: '10px'}} />
                    {' ' + t('continueWithGoogle')}
                </Button>
                <div className="line" style={{position: 'relative', height: '1px', width: '100%', backgroundColor: 'rgb(224, 224, 224)', marginTop: 10, fontFamily: "sans-serif"}}>
                    <span style={{backgroundColor: "#f5f5f5", padding: 15, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                        {t('or')}
                    </span>
                </div>
                <Form.Group style={{marginTop: 25}} controlId="formEmail">
                    <Form.Label>{t('email')}</Form.Label>
                    <Form.Control style={{width: '100%'}} type="email" value={email} onChange={e => setEmail(e.target.value)} isInvalid={touched && (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email))} />
                    <Form.Control.Feedback type="invalid">
                        {!email ? t('emailIsRequired') : t('pleaseEnterValidEmail')}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group style={{marginBottom: 10}} controlId="formPassword">
                    <Form.Label>{t('password')}</Form.Label>
                    <Form.Control style={{width: '100%'}} type="password" value={password} onChange={e => setPassword(e.target.value)} isInvalid={touched && (!password || password.length < 8)} />
                    <Form.Control.Feedback type="invalid">
                        {!password ? t('passwordIsRequired') : t('passwordMustBeAtLeast8Characters')}
                    </Form.Control.Feedback>
                </Form.Group>
                <ButtonComponent variant="primary" type="submit">{t('signIn')}</ButtonComponent>
                <div style={{marginTop: 10}}>
                    <a href={'/register'} style={{color: "gray"}}>{t('dontHaveAccount')} </a>
                    <a href={'/register'} style={{color: "orange"}}>{t('createAccount')}</a>
                </div>

            </Form>
        </div>
    );
};

export default LoginPage;