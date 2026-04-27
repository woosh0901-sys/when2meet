import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const COLORS = [
  'from-brand-500 to-brand-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
];

const EMOJIS = ['🐻', '🦊', '🐰', '🦋', '🐳'];

export default function LoginForm() {
  const { users, login, setupPin, loading } = useAuth();
  const [step, setStep] = useState('select'); // 'select' | 'enter-pin' | 'setup-pin'
  const [selectedUser, setSelectedUser] = useState(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setPin('');
    setConfirmPin('');
    setError(null);
    if (user.hasPin) {
      setStep('enter-pin');
    } else {
      setStep('setup-pin');
    }
  };

  const handleBack = () => {
    setStep('select');
    setSelectedUser(null);
    setPin('');
    setConfirmPin('');
    setError(null);
  };

  const handleLogin = async () => {
    if (pin.length !== 4) {
      setError('PIN은 4자리 숫자를 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    const result = await login(selectedUser.id, pin);
    if (!result.success) {
      setError(result.message);
      setPin('');
    }
    setSubmitting(false);
  };

  const handleSetupPin = async () => {
    if (pin.length !== 4) {
      setError('PIN은 4자리 숫자를 입력해 주세요.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PIN이 일치하지 않습니다.');
      setConfirmPin('');
      return;
    }
    setSubmitting(true);
    const result = await setupPin(selectedUser.id, pin);
    if (!result.success) {
      setError(result.message);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-surface-500">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-intersect-glow mb-4 shadow-lg shadow-brand-600/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-surface-400 bg-clip-text text-transparent">
            ScheduleSync
          </h1>
          <p className="text-surface-500 mt-1 text-sm">
            모두가 가능한 날, 함께 찾아요
          </p>
        </div>

        {/* Step: 이름 선택 */}
        {step === 'select' && (
          <div className="glass-card-strong p-6 animate-fade-in">
            <label className="block text-sm font-medium text-surface-400 mb-4 text-center">
              본인 이름을 선택하세요
            </label>
            <div className="space-y-2.5">
              {users.map((u, i) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectUser(u)}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-xl
                    bg-white/5 border border-white/5
                    hover:bg-white/10 hover:border-white/15 hover:scale-[1.02]
                    active:scale-[0.98] transition-all duration-200 group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${COLORS[i % COLORS.length]} 
                                   flex items-center justify-center shadow-lg text-lg
                                   group-hover:shadow-xl transition-shadow`}>
                    {EMOJIS[i % EMOJIS.length]}
                  </div>
                  <span className="text-white font-semibold text-base group-hover:translate-x-0.5 transition-transform">
                    {u.name}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    {u.hasPin ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-intersect/15 text-intersect/70 border border-intersect/20">
                        🔒
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400/70 border border-amber-500/20">
                        신규
                      </span>
                    )}
                    <svg className="w-5 h-5 text-surface-600 group-hover:text-surface-400 group-hover:translate-x-1 transition-all" 
                         fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: PIN 입력 (기존 사용자) */}
        {step === 'enter-pin' && selectedUser && (
          <div className="glass-card-strong p-6 animate-fade-in">
            <button onClick={handleBack} className="flex items-center gap-1 text-surface-500 hover:text-white text-sm mb-5 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              뒤로
            </button>

            <div className="text-center mb-5">
              <p className="text-white font-semibold text-lg">{selectedUser.name}</p>
              <p className="text-surface-500 text-sm mt-1">PIN 번호를 입력하세요</p>
            </div>

            <PinInput value={pin} onChange={setPin} onComplete={handleLogin} />

            {error && <ErrorMessage message={error} />}

            <button
              onClick={handleLogin}
              disabled={submitting || pin.length < 4}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
            >
              {submitting ? <Spinner /> : '로그인'}
            </button>
          </div>
        )}

        {/* Step: PIN 최초 설정 */}
        {step === 'setup-pin' && selectedUser && (
          <div className="glass-card-strong p-6 animate-fade-in">
            <button onClick={handleBack} className="flex items-center gap-1 text-surface-500 hover:text-white text-sm mb-5 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              뒤로
            </button>

            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/20 mb-3">
                <span className="text-2xl">🔐</span>
              </div>
              <p className="text-white font-semibold text-lg">{selectedUser.name}</p>
              <p className="text-surface-500 text-sm mt-1">처음이시네요! PIN 번호를 설정해 주세요</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-surface-500 mb-2 text-center">PIN 설정 (숫자 4자리)</label>
                <PinInput value={pin} onChange={(v) => { setPin(v); setError(null); }} />
              </div>
              <div>
                <label className="block text-xs text-surface-500 mb-2 text-center">PIN 확인</label>
                <PinInput value={confirmPin} onChange={(v) => { setConfirmPin(v); setError(null); }} onComplete={handleSetupPin} />
              </div>
            </div>

            {error && <ErrorMessage message={error} />}

            <button
              onClick={handleSetupPin}
              disabled={submitting || pin.length < 4 || confirmPin.length < 4}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
            >
              {submitting ? <Spinner /> : 'PIN 설정 완료'}
            </button>
          </div>
        )}

        <p className="text-center text-surface-600 text-xs mt-6">
          ScheduleSync &copy; 2026
        </p>
      </div>
    </div>
  );
}

/* ─── Sub Components ─── */

function PinInput({ value, onChange, onComplete }) {
  // 항상 4칸 배열로 관리
  const digits = value.padEnd(4, ' ').split('').slice(0, 4);

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 1) {
      const newDigits = [...digits];
      newDigits[i] = val || ' ';
      // 공백 제거 후 실제 입력된 숫자만 추출
      const newVal = newDigits.map(d => d.trim()).join('');
      onChange(newVal);
      // Auto-focus next
      if (val && i < 3) {
        e.target.parentElement.children[i + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (!value[i] && i > 0) {
        // 현재 칸이 비어있으면 이전 칸으로 이동
        const newDigits = [...digits];
        newDigits[i - 1] = ' ';
        const newVal = newDigits.map(d => d.trim()).join('');
        onChange(newVal);
        e.target.parentElement.children[i - 1]?.focus();
        e.preventDefault();
      }
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          className="w-14 h-14 text-center text-xl font-bold bg-white/5 border border-white/10 
                     rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 
                     focus:border-brand-500/50 transition-all duration-200"
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
        />
      ))}
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 mt-4 animate-fade-in">
      <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <span className="text-sm text-red-300">{message}</span>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
