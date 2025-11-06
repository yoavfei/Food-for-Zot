'use client';

import { useState } from 'react';
import { auth } from '../../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth';

const navigateTo = (path: string) => {
  if (typeof window !== 'undefined') {
    const absolutePath = `${window.location.origin}${path}`;
    window.location.replace(absolutePath);
  }
};

export default function AuthTabs() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createUserDocumentInDb = async (token: string, user: User) => {
    await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ email: user.email }),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        const token = await user.getIdToken();

        await createUserDocumentInDb(token, user);
      }

      navigateTo('/app');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Try logging in.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4 py-8 sm:px-10">
      <div className="mb-8 text-center">
        {/* Logo JSX */}
        <div className="flex items-center justify-center space-x-2">
          <span className="text-3xl" role="img" aria-label="lemon">🍋</span>
          <h1 className="text-3xl font-extrabold text-gray-800">
            Food <span className="text-green-600">For</span> Zot
          </h1>
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-gray-700">
          {isLogin ? 'Welcome back!' : 'Create your account'}
        </h2>
        <p className="text-sm text-gray-500">
          {isLogin ? 'Sign in to continue' : 'Your grocery buddy awaits'}
        </p>
      </div>

      {/* Tab Buttons */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => {
            setIsLogin(true);
            setError(null);
          }}
          className={`py-3 px-4 rounded-md text-sm font-semibold transition-all duration-200
            ${
              isLogin
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
          Login
        </button>
        <button
          onClick={() => {
            setIsLogin(false);
            setError(null);
          }}
          className={`py-3 px-4 rounded-md text-sm font-semibold transition-all duration-200
            ${
              !isLogin
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
          Sign Up
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Input Component (Inlined) */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="anteater@uci.edu"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm transition duration-150 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent
                   placeholder-gray-400"
            />
          </div>
        </div>

        {/* Input Component */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm transition duration-150 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent
                   placeholder-gray-400"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center px-4 py-3 border border-transparent 
               text-base font-semibold rounded-lg shadow-sm text-white bg-green-600 
               hover:bg-green-700 focus:outline-none focus:ring-2 
               focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out
               disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {/* LoadingSpinner */}
          {isLoading ? (
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : null}
          {isLogin ? 'Login' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}