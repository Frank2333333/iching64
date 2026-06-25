import { useState, useMemo } from 'react';
import { Calendar, Clock, MapPin, User, Sparkles, Compass, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import type { ZiweiInput } from '../../lib/ziwei-api';
import { hourToTimeIndex } from '../../data/ziwei-constants';

/** 时辰名称映射（timeIndex → 名称+范围） */
const SHICHEN_NAMES: Record<number, { name: string; range: string }> = {
  0:  { name: '早子时', range: '00:00-01:00' },
  1:  { name: '丑时',   range: '01:00-03:00' },
  2:  { name: '寅时',   range: '03:00-05:00' },
  3:  { name: '卯时',   range: '05:00-07:00' },
  4:  { name: '辰时',   range: '07:00-09:00' },
  5:  { name: '巳时',   range: '09:00-11:00' },
  6:  { name: '午时',   range: '11:00-13:00' },
  7:  { name: '未时',   range: '13:00-15:00' },
  8:  { name: '申时',   range: '15:00-17:00' },
  9:  { name: '酉时',   range: '17:00-19:00' },
  10: { name: '戌时',   range: '19:00-21:00' },
  11: { name: '亥时',   range: '21:00-23:00' },
  12: { name: '晚子时', range: '23:00-00:00' },
};

interface ZiweiFormProps {
  onSubmit: (data: ZiweiInput) => void;
  loading: boolean;
}

const STEPS = [
  { key: 'date',   label: '日期', icon: Calendar },
  { key: 'time',   label: '时间', icon: Clock },
  { key: 'gender', label: '性别', icon: User },
  { key: 'question', label: '问题', icon: Sparkles },
] as const;

export default function ZiweiForm({ onSubmit, loading }: ZiweiFormProps) {
  const today = new Date();
  const [step, setStep] = useState(0); // 0-3

  const [year, setYear] = useState(today.getFullYear().toString());
  const [month, setMonth] = useState((today.getMonth() + 1).toString());
  const [day, setDay] = useState(today.getDate().toString());
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('0');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthplace, setBirthplace] = useState('');
  const [useSolarTime, setUseSolarTime] = useState(false);
  const [question, setQuestion] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 时辰自动计算
  const shichenInfo = useMemo(() => {
    const h = parseInt(hour);
    const m = parseInt(minute);
    if (isNaN(h) || h < 0 || h > 23) return null;
    const idx = hourToTimeIndex(h, isNaN(m) ? 0 : m);
    return SHICHEN_NAMES[idx] || null;
  }, [hour, minute]);

  const inputClass = `w-full px-4 py-3 border border-amber-200 dark:border-amber-700/50
    rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600
    text-amber-900 dark:text-amber-100 bg-white dark:bg-neutral-900
    transition-colors placeholder:text-amber-400 dark:placeholder:text-amber-700/50`;

  /** 校验当前步骤 */
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      const y = parseInt(year);
      const m = parseInt(month);
      const d = parseInt(day);
      if (isNaN(y) || y < 1900 || y > 2100) newErrors.year = '请输入有效的年份 (1900-2100)';
      if (isNaN(m) || m < 1 || m > 12) newErrors.month = '请输入有效的月份 (1-12)';
      if (isNaN(d) || d < 1 || d > 31) newErrors.day = '请输入有效的日期 (1-31)';
      if (Object.keys(newErrors).length === 0) {
        const date = new Date(y, m - 1, d);
        if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
          newErrors.day = '输入的日期无效';
        }
      }
    } else if (step === 1) {
      const h = parseInt(hour);
      const min = parseInt(minute);
      if (isNaN(h) || h < 0 || h > 23) newErrors.hour = '请输入有效的小时 (0-23)';
      if (isNaN(min) || min < 0 || min > 59) newErrors.minute = '请输入有效的分钟 (0-59)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(s => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setStep(s => Math.max(s - 1, 0));
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    const h = parseInt(hour);
    const min = parseInt(minute);

    onSubmit({
      year: y,
      month: m,
      day: d,
      hour: h,
      minute: min,
      gender,
      birthplace: birthplace.trim() || undefined,
      useSolarTime,
      question: question.trim() || undefined,
    });
  };

  return (
    <div className="animate-slideInUp">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-md
                    border border-amber-200 dark:border-amber-900/30
                    dark:hover:border-amber-800/50 transition-colors">
        {/* 进度条 */}
        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={s.key} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full h-1.5 rounded-full transition-colors duration-300
                  ${isDone ? 'bg-amber-500' : isActive ? 'bg-amber-400' : 'bg-amber-100 dark:bg-amber-900/30'}`}
                />
                <div className={`flex items-center gap-1 text-[11px] transition-colors duration-300
                  ${isActive ? 'text-amber-700 dark:text-amber-300 font-medium' : isDone ? 'text-amber-500 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  <Icon className="w-3 h-3" />
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 0: 日期 */}
          {step === 0 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-4">
                <Calendar className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300">出生日期</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">请输入您的农历或公历出生日期</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: '年', value: year, set: setYear, min: 1900, max: 2100, error: errors.year, placeholder: '1990' },
                  { label: '月', value: month, set: setMonth, min: 1, max: 12, error: errors.month, placeholder: '6' },
                  { label: '日', value: day, set: setDay, min: 1, max: 31, error: errors.day, placeholder: '15' },
                ].map(({ label, value, set, min, max, error, placeholder }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">{label}</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      min={min}
                      max={max}
                      placeholder={placeholder}
                      className={inputClass}
                    />
                    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: 时间 */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-4">
                <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300">出生时间</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">紫微斗数以时辰为准，精确到分钟即可</p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">时</label>
                  <input
                    type="number"
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    min={0}
                    max={23}
                    placeholder="12"
                    className={inputClass}
                  />
                  {errors.hour && <p className="text-sm text-red-600 mt-1">{errors.hour}</p>}
                </div>
                <div className="flex items-end text-amber-600 dark:text-amber-400 text-lg pb-3">:</div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">分</label>
                  <input
                    type="number"
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    min={0}
                    max={59}
                    placeholder="0"
                    className={inputClass}
                  />
                  {errors.minute && <p className="text-sm text-red-600 mt-1">{errors.minute}</p>}
                </div>
              </div>

              {/* 时辰自动显示 */}
              {shichenInfo && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{shichenInfo.name}</span>
                  <span className="text-xs text-amber-600/70 dark:text-amber-400/70 ml-2">{shichenInfo.range}</span>
                </div>
              )}

              {/* 出生地点 + 真太阳时 */}
              <div>
                <label className="block text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />出生地点（选填）
                </label>
                <input
                  type="text"
                  value={birthplace}
                  onChange={(e) => setBirthplace(e.target.value)}
                  placeholder="例如：北京"
                  className={inputClass}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="ziwei-solar"
                  checked={useSolarTime}
                  onChange={(e) => setUseSolarTime(e.target.checked)}
                  className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:border-amber-700"
                />
                <label htmlFor="ziwei-solar" className="text-sm text-amber-700 dark:text-amber-400 cursor-pointer">
                  使用真太阳时（根据经度校正）
                </label>
              </div>
            </div>
          )}

          {/* Step 2: 性别 */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-4">
                <User className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300">性别</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">性别影响大限顺逆行方向</p>
              </div>
              <div className="flex gap-4 justify-center">
                {(['male', 'female'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex items-center gap-2 px-8 py-4 rounded-xl border-2 transition-all text-lg ${
                      gender === g
                        ? 'border-amber-500 bg-amber-500 text-white dark:bg-amber-600 dark:text-white shadow-lg scale-105'
                        : 'border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400 hover:border-amber-400 bg-white dark:bg-neutral-900'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-bold">{g === 'male' ? '男' : '女'}</span>
                    {gender === g && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: 问题 */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-4">
                <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300">想问什么？</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">选填，帮助 AI 更有针对性地解读</p>
              </div>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="例如：我想了解我的事业运势..."
                rows={4}
                className={`${inputClass} resize-none`}
              />
              {/* 信息摘要预览 */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                <div>📅 {year}年{month}月{day}日 {hour}:{minute.padStart(2, '0')}</div>
                {shichenInfo && <div>🕐 {shichenInfo.name}（{shichenInfo.range}）</div>}
                <div>{gender === 'male' ? '♂ 男' : '♀ 女'}{birthplace ? ` · ${birthplace}` : ''}{useSolarTime ? ' · 真太阳时' : ''}</div>
              </div>
            </div>
          )}

          {/* 导航按钮 */}
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1 px-6 py-3 rounded-lg border border-amber-200 dark:border-amber-800/30
                  text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />上一步
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-600 to-orange-600
                  hover:from-amber-700 hover:to-orange-700 dark:from-amber-500 dark:to-orange-500
                  text-white dark:text-neutral-900 font-bold rounded-lg transition-all shadow-md
                  hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                下一步<ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-600 to-orange-600
                  hover:from-amber-700 hover:to-orange-700 dark:from-amber-500 dark:to-orange-500
                  dark:hover:from-amber-400 dark:hover:to-orange-400
                  text-white dark:text-neutral-900 font-bold rounded-lg transition-all shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />正在排盘中...</>
                ) : (
                  <><Compass className="w-5 h-5" />开始排盘</>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
