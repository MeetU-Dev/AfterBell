import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiLoader, FiLock, FiMail, FiPhone, FiRefreshCw, FiShield } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import OTPInput from '../components/OTPInput';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const COUNTRY_CODES = [
  { label: 'US (+1)', value: '+1' },
  { label: 'India (+91)', value: '+91' },
  { label: 'UK (+44)', value: '+44' },
  { label: 'UAE (+971)', value: '+971' },
  { label: 'Australia (+61)', value: '+61' },
];

const LoginPage: React.FC = () => {
  const { login, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'phone' | 'admin'>('phone');
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'teen' | 'parent'>('teen');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCooldown(previous => {
        if (previous <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setErrors({ phone: 'Phone number is required' });
      return;
    }

    setLoading(true);
    setErrors({});

    const result = await sendOtp({
      phone: trimmedPhone,
      countryCode,
      role,
      intent: 'login',
    });

    setLoading(false);

    if (!result.success) {
      setErrors({ general: result.message || 'Unable to send OTP' });
      return;
    }

    setOtpSent(true);
    setOtp('');
    setResendCooldown(30);
    showToast('success', 'OTP sent', `We sent a 6-digit code to ${countryCode} ${trimmedPhone}.`, 2500);
  };

  const handleVerifyOtp = async (value?: string) => {
    const currentOtp = (value || otp).trim();
    if (currentOtp.length !== 6 || loading) return;

    setLoading(true);
    setErrors({});

    const result = await verifyOtp({
      phone: phone.trim(),
      countryCode,
      otp: currentOtp,
    });

    setLoading(false);

    if (!result.success) {
      setErrors({ general: result.message || 'Invalid OTP' });
      setOtp('');
      return;
    }

    showToast('success', 'Welcome back!', 'You are now logged in to AfterBell.', 1000);
    setTimeout(() => {
      navigate(result.role === 'parent' ? '/parent/dashboard' : result.role === 'admin' ? '/admin' : '/skills');
    }, 600);
  };

  const handleAdminLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await login(adminEmail, adminPassword);
    setLoading(false);

    if (!result.success) {
      setErrors({ general: result.message || 'Invalid email or password. Please try again.' });
      return;
    }

    showToast('success', 'Welcome back!', 'Successfully logged in to AfterBell.', 1000);
    setTimeout(() => {
      navigate(result.role === 'parent' ? '/parent/dashboard' : result.role === 'admin' ? '/admin' : '/skills');
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] relative overflow-hidden px-4 py-8 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(80,200,120,0.12),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_24%),linear-gradient(135deg,_rgba(15,23,42,0.92),_rgba(10,14,28,0.98))]" />

      <motion.div
        className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hidden lg:block text-white">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-green/10 border border-secondary-green/30 text-secondary-green text-sm font-medium mb-6">
              <FiShield className="w-4 h-4" />
              Phone-first access
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold font-display mb-4 leading-tight">
              Login with a quick OTP, then get straight back to learning.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Admins can still use the existing email/password path. Students and parents can sign in with phone numbers and a 6-digit code.
            </p>
          </div>
        </div>

        <motion.div
          className="w-full max-w-md mx-auto bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-6">
            <img src="/Logo.png" alt="AfterBell" className="h-10 w-auto mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-slate-400 text-sm mt-1">Choose phone OTP or admin email login</p>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-1 rounded-2xl border border-slate-700/60 mb-6">
            <button
              type="button"
              onClick={() => setMode('phone')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all ${mode === 'phone' ? 'bg-secondary-green text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Phone OTP
            </button>
            <button
              type="button"
              onClick={() => setMode('admin')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all ${mode === 'admin' ? 'bg-secondary-green text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Admin Login
            </button>
          </div>

          {mode === 'phone' ? (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Phone number</label>
                    <div className="grid grid-cols-[160px_1fr] gap-3">
                      <div className="relative">
                        <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        <select
                          value={countryCode}
                          onChange={event => setCountryCode(event.target.value)}
                          className="w-full pl-10 pr-9 py-3 bg-slate-700/60 border border-slate-600 rounded-xl text-white outline-none focus:border-secondary-green focus:ring-1 focus:ring-secondary-green appearance-none cursor-pointer text-sm font-medium"
                        >
                          {COUNTRY_CODES.map(option => (
                            <option key={option.value} value={option.value} className="bg-slate-900 text-white">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={event => {
                          setPhone(event.target.value);
                          setErrors(previous => ({ ...previous, phone: '' }));
                        }}
                        placeholder="Enter phone number"
                        className="w-full px-4 py-3 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green"
                      />
                    </div>
                    {errors.phone && <p className="mt-2 text-sm text-red-400">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">I am a</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('teen')}
                        className={`py-3 rounded-xl border transition-all ${role === 'teen' ? 'border-secondary-green bg-secondary-green/15 text-secondary-green' : 'border-slate-600 bg-slate-700/40 text-slate-300'}`}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('parent')}
                        className={`py-3 rounded-xl border transition-all ${role === 'parent' ? 'border-secondary-green bg-secondary-green/15 text-secondary-green' : 'border-slate-600 bg-slate-700/40 text-slate-300'}`}
                      >
                        Parent
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-secondary-green text-white font-semibold hover:bg-emerald-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiArrowRight className="w-4 h-4" />}
                    Send OTP
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Enter the 6-digit code sent to</p>
                    <p className="text-white font-semibold">{countryCode} {phone.trim()}</p>
                  </div>

                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    onComplete={handleVerifyOtp}
                    disabled={loading}
                  />

                  {errors.general && <p className="text-sm text-red-400 text-center">{errors.general}</p>}

                  <button
                    type="button"
                    onClick={() => void handleVerifyOtp()}
                    disabled={loading || otp.length !== 6}
                    className="w-full py-3.5 rounded-xl bg-secondary-green text-white font-semibold hover:bg-emerald-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiArrowRight className="w-4 h-4" />}
                    Verify & Sign In
                  </button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setOtp('');
                        void handleSendOtp();
                      }}
                      disabled={resendCooldown > 0 || loading}
                      className="inline-flex items-center gap-2 text-slate-300 hover:text-white disabled:opacity-50"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                        setErrors({});
                      }}
                      className="text-secondary-green hover:text-emerald-400"
                    >
                      Change number
                    </button>
                  </div>
                </>
              )}

              {errors.general && !otpSent && <p className="text-sm text-red-400 text-center">{errors.general}</p>}
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleAdminLogin}>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={event => setAdminEmail(event.target.value)}
                    placeholder="admin@afterbell.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={event => setAdminPassword(event.target.value)}
                    placeholder="Admin password"
                    className="w-full pl-10 pr-12 py-3 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(previous => !previous)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {errors.general && (
                <div className="text-sm text-red-400 text-center">
                  <p>{errors.general}</p>
                  {errors.general.includes('server running') && (
                    <p className="text-xs text-slate-400 mt-1">Start the backend: <code className="text-secondary-green">npm run dev:server</code></p>
                  )}
                  {errors.general.includes('Invalid') && (
                    <p className="text-xs text-slate-400 mt-1">Run <code className="text-secondary-green">npm run seed:admin</code> first to create the admin user</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-secondary-green text-white font-semibold hover:bg-emerald-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiArrowRight className="w-4 h-4" />}
                Login
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-400">
            <p>
              Don’t have an account?{' '}
              <Link to="/signup" className="text-secondary-green hover:text-emerald-400 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
