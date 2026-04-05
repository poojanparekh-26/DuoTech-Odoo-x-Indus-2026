// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/auth/SignupPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from '../../components/ui/Toast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Signup failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-wide">Create Account</h2>
          <p className="text-gray-400 text-sm mt-2">Sign up for Odoo POS Cafe</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Name" 
            type="text" 
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input 
            label="Email" 
            type="email" 
            placeholder="user@pos.com"
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
            className="w-full mt-4 py-2.5 font-bold text-lg rounded-lg bg-amber-600 hover:bg-amber-500"
          >
            Sign Up
          </Button>
        </form>
        
        <p className="text-gray-400 text-center mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
