'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function AuthPage() {
  const router = useRouter();
  const { login, register, isLoading } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginEmail || !loginPassword) return;

    const res = await login(loginEmail, loginPassword);
    if (res.success) {
      router.push('/menu');
    } else {
      setError(res.error || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regName || !regEmail || !regPhone || !regPassword) return;

    const res = await register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
    });

    if (res.success) {
      router.push('/menu');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  const handleDemoLogin = (type: 'customer' | 'gold') => {
    setLoginEmail(type === 'customer' ? 'demo@hobi.com' : 'gold@hobi.com');
    setLoginPassword('1234');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#f6e5cc]">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c41e3a]/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden relative z-10 shadow-xl border border-[#88042b]/10"
      >
        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`flex-1 py-4 text-sm transition-colors relative font-bold ${
              activeTab === 'login' ? 'text-[#88042b]' : 'text-gray-500 hover:text-[#88042b]/70'
            }`}
          >
            เข้าสู่ระบบ
            {activeTab === 'login' && (
              <motion.div layoutId="authTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#88042b] to-[#c41e3a]" />
            )}
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(null); }}
            className={`flex-1 py-4 text-sm transition-colors relative font-bold ${
              activeTab === 'register' ? 'text-[#88042b]' : 'text-gray-500 hover:text-[#88042b]/70'
            }`}
          >
            สมัครสมาชิก
            {activeTab === 'register' && (
              <motion.div layoutId="authTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#88042b] to-[#c41e3a]" />
            )}
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2 text-[#88042b]">ยินดีต้อนรับกลับมา</h2>
                  <p className="text-sm text-gray-600 font-medium">เข้าสู่ระบบเพื่อสั่งอาหารและสะสมแต้ม</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium text-center shadow-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#88042b] transition-colors" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="อีเมล"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-black placeholder:text-gray-400 focus:outline-none focus:border-[#88042b]/50 focus:bg-white focus:ring-1 focus:ring-[#88042b]/50 transition-all shadow-inner"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#88042b] transition-colors" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="รหัสผ่าน"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-black placeholder:text-gray-400 focus:outline-none focus:border-[#88042b]/50 focus:bg-white focus:ring-1 focus:ring-[#88042b]/50 transition-all shadow-inner"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-[#88042b] to-[#c41e3a] text-white rounded-xl font-bold transition-transform hover:scale-[1.02] shadow-md flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        เข้าสู่ระบบ
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-xs text-center font-bold text-gray-500 mb-4">เข้าสู่ระบบรวดเร็ว (Demo)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('customer')}
                      className="py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 transition-colors shadow-sm"
                    >
                      ลูกค้าทั่วไป
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('gold')}
                      className="py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-sm font-bold text-amber-700 transition-colors shadow-sm"
                    >
                      ลูกค้า Gold
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2 text-[#88042b]">สมัครสมาชิกใหม่</h2>
                  <p className="text-sm text-gray-600 font-medium">รับโบนัส 50 แต้มทันทีเมื่อสมัคร</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium text-center shadow-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#88042b] transition-colors" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="ชื่อ - นามสกุล"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-black placeholder:text-gray-400 focus:outline-none focus:border-[#88042b]/50 focus:bg-white focus:ring-1 focus:ring-[#88042b]/50 transition-all shadow-inner"
                    />
                  </div>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#88042b] transition-colors" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="อีเมล"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-black placeholder:text-gray-400 focus:outline-none focus:border-[#88042b]/50 focus:bg-white focus:ring-1 focus:ring-[#88042b]/50 transition-all shadow-inner"
                    />
                  </div>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#88042b] transition-colors" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="เบอร์โทรศัพท์"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-black placeholder:text-gray-400 focus:outline-none focus:border-[#88042b]/50 focus:bg-white focus:ring-1 focus:ring-[#88042b]/50 transition-all shadow-inner"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#88042b] transition-colors" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="รหัสผ่าน"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-black placeholder:text-gray-400 focus:outline-none focus:border-[#88042b]/50 focus:bg-white focus:ring-1 focus:ring-[#88042b]/50 transition-all shadow-inner"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-[#88042b] to-[#c41e3a] text-white rounded-xl font-bold transition-transform hover:scale-[1.02] shadow-md flex items-center justify-center gap-2 group mt-2 disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'สร้างบัญชี'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
