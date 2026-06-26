import React, { useState } from 'react';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import i18n from "./utils/i18n";

export default function AuthModal({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setSuccess(i18n.t('account.accountCreatedCheckEmail'));
        setTimeout(() => {onClose();}, 1000);
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        setSuccess(i18n.t('account.signedInSuccessfully'));
        setTimeout(() => onClose(), 1000);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative">
          <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isSignUp ? (i18n.t('auth.createAccount')) : (i18n.t('auth.welcomeBack'))}
          </h2>
          <p className="text-gray-600 mb-6">
            {isSignUp ? (i18n.t('auth.signUpToSave')) : (i18n.t('auth.signInToAccess'))}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {i18n.t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink-500 focus:border-transparent"
                    placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {i18n.t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink-500 focus:border-transparent"
                    placeholder="••••••••"
                />
              </div>
              {isSignUp && (
                  <p className="text-xs text-gray-500 mt-1">{i18n.t('auth.passwordRequirement')}</p>
              )}
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
            )}

            {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {success}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-ink-600 text-white rounded-lg font-semibold hover:bg-ink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isSignUp ? (i18n.t('auth.creatingAccount')) : (i18n.t('auth.signingIn'))}
                  </>
              ) : (
                  isSignUp ? (i18n.t('auth.createAccount')) : (i18n.t('auth.signIn'))
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                }}
                className="text-ink-600 hover:text-ink-700 font-medium"
            >
              {isSignUp ? (i18n.t('auth.hasAccount')) : (i18n.t('auth.noAccount'))}
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500 text-center">
            {i18n.t('auth.worksWithout')}
          </p>
        </div>
      </div>
  );
}