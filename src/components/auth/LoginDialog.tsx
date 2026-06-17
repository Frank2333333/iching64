import { useState, useEffect, useCallback } from 'react';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { sendVerificationCode, verifyCode } from '../../lib/auth-api';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (token: string, user: { id: string; email: string }) => void;
}

export default function LoginDialog({ open, onOpenChange, onLogin }: LoginDialogProps) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = useCallback(async () => {
    setError('');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('请输入有效的邮箱地址');
      return;
    }
    setLoading(true);
    const res = await sendVerificationCode(email.trim());
    setLoading(false);
    if (res.success) {
      setStep('code');
      setCountdown(60);
    } else {
      setError(res.error || '发送失败');
    }
  }, [email]);

  const handleVerify = useCallback(async () => {
    setError('');
    if (code.length !== 6) {
      setError('请输入完整的6位验证码');
      return;
    }
    setLoading(true);
    const res = await verifyCode(email.trim(), code);
    setLoading(false);
    if (res.success && res.data) {
      onLogin(res.data.token, res.data.user);
      // 重置状态
      setStep('email');
      setEmail('');
      setCode('');
      setCountdown(0);
      onOpenChange(false);
    } else {
      setError(res.error || '验证失败');
    }
  }, [code, email, onLogin, onOpenChange]);

  const handleBack = useCallback(() => {
    setStep('email');
    setCode('');
    setError('');
  }, []);

  // Dialog 关闭时重置状态
  const handleOpenChange = useCallback(
    (val: boolean) => {
      if (!val) {
        setStep('email');
        setEmail('');
        setCode('');
        setError('');
        setCountdown(0);
      }
      onOpenChange(val);
    },
    [onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border-amber-200 dark:border-amber-900/30">
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
            {step === 'code' && (
              <button
                type="button"
                onClick={handleBack}
                className="p-1 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {step === 'email' ? '登录 / 注册' : '输入验证码'}
          </DialogTitle>
        </DialogHeader>

        {step === 'email' ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-amber-800 dark:text-amber-400">
                邮箱地址
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                  className="pl-10 border-amber-200 dark:border-amber-700/50 focus-visible:ring-amber-500 dark:focus-visible:ring-amber-600"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                '获取验证码'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              验证码已发送至 <span className="font-semibold">{email}</span>
            </p>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                onComplete={handleVerify}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <Button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                '登录'
              )}
            </Button>

            <div className="text-center">
              {countdown > 0 ? (
                <span className="text-sm text-amber-500">{countdown} 秒后重新发送</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={loading}
                  className="text-sm text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 font-medium disabled:text-amber-300"
                >
                  重新发送验证码
                </button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
