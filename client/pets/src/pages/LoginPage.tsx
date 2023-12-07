import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch(`http://localhost:3001/api/users?email=${email}&password=${password}`);
        const data = await response.json();

        if (data.error) {
            alert('Error logging in');
        } else {
            alert('Logged in successfully');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:3001/api/users/google';
    };

    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <Form style={{width: '50%'}} onSubmit={handleLogin}>
                <Button variant="primary" onClick={handleGoogleLogin} style={{color:'black', backgroundColor: 'white', borderColor: 'black', fontFamily: "sans-serif", fontWeight: 5000}}>
                    <img src="/google_logo.webp" alt="Google logo" style={{width: '20px', marginRight: '10px'}} />
                    Continue with Google
                </Button>
                <p style={{fontFamily: "sans-serif"}}>
                    OR
                </p>
                <Form.Group controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control style={{width: '100%'}} type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </Form.Group>
                <Form.Group controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control style={{width: '100%'}} type="password" value={password} onChange={e => setPassword(e.target.value)} />
                </Form.Group>
                <Button variant="primary" type="submit" style={{color: 'white', backgroundColor: 'gold'}}>Sign in</Button>
            </Form>
        </div>
    );
};

export default LoginPage;