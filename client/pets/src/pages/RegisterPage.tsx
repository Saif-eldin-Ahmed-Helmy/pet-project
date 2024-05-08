import React, { useState } from 'react';
import {Form, Button, Alert, InputGroup} from 'react-bootstrap';
import {useNavigate} from "react-router-dom";
import ButtonComponent from "../components/Button/Button.tsx";
import { useTranslation } from 'react-i18next';

const RegisterPage: React.FC = () => {
    const { t } = useTranslation();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);

        if (!firstName || !lastName || !email || !password || !confirmPassword || !gender || !dateOfBirth) {
            setError(t('allFieldsAreRequired'));
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError(t('emailIsNotValid'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('passwordsDoNotMatch'));
            return;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password)) {
           // setError(t('passwordMustBeAtLeast8CharactersLong'));
           // return;
        }

        const name = firstName.trim().charAt(0).toUpperCase() + firstName.trim().slice(1) + ' '
            + lastName.trim().charAt(0).toUpperCase() + lastName.trim().slice(1);
        const response = await fetch('https://pet-ssq2.onrender.com/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, gender, dateOfBirth })
        });

        const data = await response.json();

        if (data.error) {
            setError(data.error);
        } else {
            navigate('/');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'https://pet-ssq2.onrender.com/api/users/google';
    };

    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <Form style={{width: '50%'}} onSubmit={handleSubmit}>
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
                <Form.Group style={{marginTop: 25}} controlId="formFirstName">
                    <Form.Label>{t('firstName')}</Form.Label>
                    <Form.Control type="text" value={firstName} onChange={e => setFirstName(e.target.value)} isInvalid={touched && !firstName} />
                    <Form.Control.Feedback type="invalid">
                        {t('firstNameIsRequired')}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formLastName">
                    <Form.Label>{t('lastName')}</Form.Label>
                    <Form.Control type="text" value={lastName} onChange={e => setLastName(e.target.value)} isInvalid={touched && !lastName} />
                    <Form.Control.Feedback type="invalid">
                        {t('lastNameIsRequired')}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formEmail">
                    <Form.Label>{t('email')}</Form.Label>
                    <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} isInvalid={touched && (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email))} />
                    <Form.Control.Feedback type="invalid">
                        {!email ? t('emailIsRequired') : t('pleaseEnterValidEmail')}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formPassword">
                    <Form.Label>{t('password')}</Form.Label>
                    <InputGroup>
                        <Form.Control type={ "password"} value={password} onChange={e => setPassword(e.target.value)} isInvalid={touched && (!password || password.length < 8)} />
                        <Form.Control.Feedback type="invalid">
                            {!password ? t('passwordIsRequired') : t('passwordMustBeAtLeast8Characters')}
                        </Form.Control.Feedback>
                    </InputGroup>
                </Form.Group>
                <Form.Group controlId="formConfirmPassword">
                    <Form.Label>{t('confirmPassword')}</Form.Label>
                    <Form.Control type={"password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} isInvalid={touched && (password !== confirmPassword || !confirmPassword)} />
                    <Form.Control.Feedback type="invalid">
                        {!confirmPassword ? t('passwordIsRequired') : t('passwordsDoNotMatch')}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formGender">
                    <Form.Label>{t('gender')}</Form.Label>
                    <Form.Control as="select" value={gender} onChange={e => setGender(e.target.value)} isInvalid={touched && !gender}>
                        <option value="">{t('select')}</option>
                        <option value="male">{t('male')}</option>
                        <option value="female">{t('female')}</option>
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                        {t('genderIsRequired')}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group style={{marginBottom: 10}} controlId="formDateOfBirth">
                    <Form.Label>{t('dateOfBirth')}</Form.Label>
                    <Form.Control type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} isInvalid={touched && !dateOfBirth}/>
                    <Form.Control.Feedback type="invalid">
                        {t('dateOfBirthIsRequired')}
                    </Form.Control.Feedback>
                </Form.Group>
                <ButtonComponent variant="primary" type="submit">Register</ButtonComponent>
            </Form>
        </div>
    );
};

export default RegisterPage;