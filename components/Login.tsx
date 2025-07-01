
import React, { useState } from 'react';
import { UserIcon, LockClosedIcon } from './icons';
import { branding } from '../branding';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const brand = branding.brand;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setError('');
    // In a real app, you'd perform authentication here.
    // For this demo, we'll just call the onLogin prop to simulate success.
    onLogin(username);
  };

  return (
    <div className="w-full max-w-md bg-[rgba(0,0,0,0.3)] shadow-2xl rounded-lg p-8 space-y-6 backdrop-blur-sm border border-slate-700/50">
      <div className="text-center">
        <img 
          src={brand.logo.title} 
          alt={`${brand.organizationShortName} Logo`} 
          className="w-40 mx-auto h-auto mb-4"
        />
        <h2 className="text-2xl font-bold text-slate-100">
          Medical Image Analysis
        </h2>
        <p className="text-slate-400 mt-1">Please log in to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <UserIcon className="w-5 h-5 text-slate-500" />
          </span>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className="w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-md placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--hnai-primary-color)] focus:border-[var(--hnai-primary-color)] transition-all"
            placeholder="Username (e.g., email)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <LockClosedIcon className="w-5 h-5 text-slate-500" />
          </span>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-md placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--hnai-primary-color)] focus:border-[var(--hnai-primary-color)] transition-all"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-600 text-[var(--hnai-primary-color)] focus:ring-[var(--hnai-primary-color)] bg-slate-700"
            />
            <label htmlFor="remember-me" className="ml-2 block text-slate-300">
              Remember me
            </label>
          </div>

          <div className="font-medium text-[var(--hnai-primary-color)] hover:text-yellow-300 transition-colors">
            <a href="#">Forgot Password?</a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-[var(--hnai-text-on-primary)] bg-[var(--hnai-primary-color)] hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--hnai-primary-color)] focus:ring-offset-slate-900 transition-all"
          >
            Login
          </button>
        </div>
      </form>

      <div className="text-center text-sm text-slate-400">
        <p>New user? <a href="#" className="font-medium text-[var(--hnai-primary-color)] hover:text-yellow-300 transition-colors">Request access</a></p>
      </div>

      <div className="border-t border-slate-700 pt-4 mt-6 text-center">
        <p className="text-xs text-slate-500">
            Ensure compliance with HIPAA, GDPR, and/or DICOM-based security policies.
        </p>
      </div>
    </div>
  );
};
