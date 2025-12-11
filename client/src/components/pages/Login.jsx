import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (data.success) {
                login(); // Set global auth state
                navigate('/admin'); // Go to Dashboard
            } else {
                setError('Invalid Username or Password');
            }
        } catch (err) {
            setError('Connection failed. Is the server running?');
        }
    };

    return (
        <div className="admin-scroll-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="admin-section" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#2E8B57' }}>Admin Login</h2>
                
                <form onSubmit={handleSubmit} className="admin-form">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                    />
                    
                    {error && <p style={{ color: '#d9534f', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}
                    
                    <button type="submit">Sign In</button>
                </form>
            </div>
        </div>
    );
};

export default Login;