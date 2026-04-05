// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/auth/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from '../../components/ui/Toast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // useAuth hook already shows toast with server error message
      // Only show fallback if no response error was handled
      if (!err.response?.data?.error) {
        toast.error('Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-wide">Login to Odoo POS</h2>
          <p className="text-gray-400 text-sm mt-2">Welcome back! Please enter your details.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Email" 
            type="email" 
            placeholder="admin@pos.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button 
            type="submit" 
            variant="primary" 
            loading={loading} 
            className="w-full mt-2 py-2.5 font-bold text-lg rounded-lg"
          >
            Login
          </Button>
        </form>
        
        <p className="text-gray-400 text-center mt-6 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-amber-500 hover:text-amber-400 font-medium">
            Sign Up here
          </Link>
        </p>
      </div>
    </div>
  );
};
