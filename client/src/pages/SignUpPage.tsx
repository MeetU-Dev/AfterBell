import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiLoader, FiMail, FiPhone, FiRefreshCw, FiUser } from 'react-icons/fi';
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

const SignUpPage: React.FC = () => {
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState<'details' | 'otp' | 'success'>('details');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'teen' | 'parent'>('teen');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [parentVerifyUrl, setParentVerifyUrl] = useState<string | null>(null);

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

  const validateDetails = () => {
    const nextErrors: Record<string, string> = {};

    if (!firstName.trim()) nextErrors.firstName = 'First name is required';
    if (!lastName.trim()) nextErrors.lastName = 'Last name is required';
    if (!phone.trim()) nextErrors.phone = 'Phone number is required';
    if (email.trim() && !/\S+@\S+\.\S+/.test(email.trim())) nextErrors.email = 'Please enter a valid email';
    if (role === 'teen') {
      if (!parentEmail.trim()) nextErrors.parentEmail = 'Parent email is required for teen signup';
      else if (!/\S+@\S+\.\S+/.test(parentEmail.trim())) nextErrors.parentEmail = 'Please enter a valid parent email';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const sendCode = async () => {
    if (!validateDetails()) return;

    setLoading(true);
    setErrors({});

    const result = await sendOtp({
      phone: phone.trim(),
      countryCode,
      role,
      intent: 'signup',
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      email: email.trim() || undefined,
      parentEmail: role === 'teen' ? parentEmail.trim() : undefined,
      parentPhone: role === 'teen' && parentPhone.trim() ? parentPhone.trim() : undefined,
    });

    setLoading(false);

    if (!result.success) {
      setErrors({ general: result.message || 'Unable to send OTP' });
      return;
    }

    setStep('otp');
    setOtp('');
    setResendCooldown(30);
    showToast('success', 'OTP sent', `We sent a verification code to ${countryCode} ${phone.trim()}.`, 2500);
  };

  const verifyCode = async (value?: string) => {
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

    setSuccessMessage(result.message || 'Your account is ready.');
    setParentVerifyUrl(result.parentVerifyUrl || null);

    if (role === 'parent') {
      showToast('success', 'Account created', 'Your parent account is ready.', 1200);
      setTimeout(() => navigate('/parent/dashboard'), 700);
      return;
    }

    if (result.parentVerifyUrl) {
      setStep('success');
      showToast('success', 'Account created', 'Parent approval link is ready in development.', 2000);
      return;
    }

    showToast('success', 'Account created', 'Welcome to AfterBell!', 1200);
    setTimeout(() => navigate('/skills'), 700);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setOtp('');
    await sendCode();
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
              <FiUser className="w-4 h-4" />
              Phone-first signup
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold font-display mb-4 leading-tight">
              Create an account with your phone and verify it in seconds.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Teens can still enter a parent email so the approval flow remains intact. No password is needed for phone-based accounts.
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
            <h2 className="text-2xl font-bold text-white">Join AfterBell</h2>
            <p className="text-slate-400 text-sm mt-1">Use your phone number and a 6-digit code</p>
          </div>

          {step === 'details' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">First name</label>
                  <input
                    value={firstName}
                    onChange={event => {
                      setFirstName(event.target.value);
                      setErrors(previous => ({ ...previous, firstName: '' }));
                    }}
                    placeholder="First name"
                    className="w-full px-4 py-3 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green"
                  />
                  {errors.firstName && <p className="mt-2 text-sm text-red-400">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Last name</label>
                  <input
                    value={lastName}
                    onChange={event => {
                      setLastName(event.target.value);
                      setErrors(previous => ({ ...previous, lastName: '' }));
                    }}
                    placeholder="Last name"
                    className="w-full px-4 py-3 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green"
                  />
                  {errors.lastName && <p className="mt-2 text-sm text-red-400">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Email (optional)</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green"
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
              </div>

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
                <label className="block text-sm text-slate-300 mb-2">Account type</label>
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

              {role === 'teen' && (
                <>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Parent email</label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="email"
                        value={parentEmail}
                        onChange={event => {
                          setParentEmail(event.target.value);
                          setErrors(previous => ({ ...previous, parentEmail: '' }));
                        }}
                        placeholder="parent@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green"
                      />
                    </div>
                    {errors.parentEmail && <p className="mt-2 text-sm text-red-400">{errors.parentEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Parent phone (optional)</label>
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={event => setParentPhone(event.target.value)}
                      placeholder="Parent phone"
                      className="w-full px-4 py-3 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 outline-none focus:border-secondary-green"
                    />
                  </div>
                </>
              )}

              {errors.general && <p className="text-sm text-red-400 text-center">{errors.general}</p>}

              <button
                type="button"
                onClick={sendCode}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-secondary-green text-white font-semibold hover:bg-emerald-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiArrowRight className="w-4 h-4" />}
                Send OTP
              </button>

              <p className="text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-secondary-green hover:text-emerald-400 font-semibold">
                  Log in
                </Link>
              </p>
            </div>
          ) : step === 'otp' ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm">Enter the 6-digit code sent to</p>
                <p className="text-white font-semibold">{countryCode} {phone.trim()}</p>
              </div>

              <OTPInput
                value={otp}
                onChange={setOtp}
                onComplete={verifyCode}
                disabled={loading}
              />

              {errors.general && <p className="text-sm text-red-400 text-center">{errors.general}</p>}

              <button
                type="button"
                onClick={() => void verifyCode()}
                disabled={loading || otp.length !== 6}
                className="w-full py-3.5 rounded-xl bg-secondary-green text-white font-semibold hover:bg-emerald-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiArrowRight className="w-4 h-4" />}
                Verify & Create Account
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white disabled:opacity-50"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('details');
                    setOtp('');
                    setErrors({});
                  }}
                  className="text-secondary-green hover:text-emerald-400"
                >
                  Edit details
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-green/10 border border-secondary-green/30 text-secondary-green text-sm font-medium mx-auto">
                Account ready
              </div>
              <h3 className="text-2xl font-bold text-white">{successMessage}</h3>
              {parentVerifyUrl && (
                <div className="rounded-2xl border border-secondary-green/30 bg-secondary-green/10 p-4 text-left">
                  <p className="text-secondary-green font-semibold mb-2">Parent verification link</p>
                  <a href={parentVerifyUrl} target="_blank" rel="noreferrer" className="text-sm text-white underline break-all">
                    {parentVerifyUrl}
                  </a>
                </div>
              )}
              <button
                type="button"
                onClick={() => navigate('/skills')}
                className="w-full py-3.5 rounded-xl bg-secondary-green text-white font-semibold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
              >
                Go to skills
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
