import { useState } from 'react';
import { Clock, MapPin, User, Sparkles, Compass, Check } from 'lucide-react';
import type { ZiweiInput } from '../../lib/ziwei-api';

interface ZiweiFormProps {
  onSubmit: (data: ZiweiInput) => void;
  loading: boolean;
}

export default function ZiweiForm({ onSubmit, loading }: ZiweiFormProps) {
  const today = new Date();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    const h = parseInt(hour);
    const min = parseInt(minute);

    if (isNaN(y) || y < 1900 || y > 2100) newErrors.year = '请输入有效的出生年份 (1900-2100)';
    if (isNaN(m) || m < 1 || m > 12) newErrors.month = '请输入有效的出生月份 (1-12)';
    if (isNaN(d) || d < 1 || d > 31) newErrors.day = '请输入有效的出生日期 (1-31)';
    if (isNaN(h) || h < 0 || h > 23) newErrors.hour = '请输入有效的小时 (0-23)';
    if (isNaN(min) || min < 0 || min > 59) newErrors.minute = '请输入有效的分钟 (0-59)';

    if (Object.keys(newErrors).length === 0) {
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
        newErrors.day = '输入的日期无效';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

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

  const inputClass = `w-full px-4 py-3 border border-amber-200 dark:border-amber-700/50
    rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600
    text-amber-900 dark:text-amber-100 bg-white dark:bg-neutral-900
    transition-colors placeholder:text-amber-400 dark:placeholder:text-amber-700/50`;

  return (
    <div className="animate-slideInUp">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-md
                    border border-amber-200 dark:border-amber-900/30
                    dark:hover:border-amber-800/50 transition-colors">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 性别 */}
          <div>
            <label className="block text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">性别</label>
            <div className="flex gap-4">
              {(['male', 'female'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                    gender === g
                      ? 'border-amber-500 bg-amber-500 text-white dark:bg-amber-600 dark:text-white shadow-md'
                      : 'border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400 hover:border-amber-400 bg-white dark:bg-neutral-900'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{g === 'male' ? '男' : '女'}</span>
                  {gender === g && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* 出生日期 */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '年', value: year, set: setYear, min: 1900, max: 2100, error: errors.year },
              { label: '月', value: month, set: setMonth, min: 1, max: 12, error: errors.month },
              { label: '日', value: day, set: setDay, min: 1, max: 31, error: errors.day },
            ].map(({ label, value, set, min, max, error }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">{label}</label>
                <input type="number" value={value} onChange={(e) => set(e.target.value)} min={min} max={max} required className={inputClass} />
                {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
              </div>
            ))}
          </div>

          {/* 出生时间 */}
          <div>
            <label className="block text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />出生时间
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <input type="number" value={hour} onChange={(e) => setHour(e.target.value)} min={0} max={23} required placeholder="时" className={inputClass} />
                {errors.hour && <p className="text-sm text-red-600 mt-1">{errors.hour}</p>}
              </div>
              <div className="flex items-center text-amber-600 dark:text-amber-400 text-lg">:</div>
              <div className="flex-1">
                <input type="number" value={minute} onChange={(e) => setMinute(e.target.value)} min={0} max={59} required placeholder="分" className={inputClass} />
                {errors.minute && <p className="text-sm text-red-600 mt-1">{errors.minute}</p>}
              </div>
            </div>
          </div>

          {/* 出生地点 */}
          <div>
            <label className="block text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />出生地点（选填）
            </label>
            <input type="text" value={birthplace} onChange={(e) => setBirthplace(e.target.value)} placeholder="例如：北京" className={inputClass} />
          </div>

          {/* 真太阳时 */}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="ziwei-solar" checked={useSolarTime} onChange={(e) => setUseSolarTime(e.target.checked)} className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:border-amber-700" />
            <label htmlFor="ziwei-solar" className="text-sm text-amber-700 dark:text-amber-400 cursor-pointer">使用真太阳时（根据经度校正）</label>
          </div>

          {/* 问题 */}
          <div>
            <label className="block text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">
              <Sparkles className="w-4 h-4 inline mr-1" />您想咨询的问题（选填）
            </label>
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="例如：我想了解我的事业运势..." rows={3} className={`${inputClass} resize-none`} />
          </div>

          {/* 提交 */}
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 dark:from-amber-500 dark:to-orange-500 dark:hover:from-amber-400 dark:hover:to-orange-400 text-white dark:text-neutral-900 font-bold rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />正在排盘中...</>
            ) : (
              <><Compass className="w-5 h-5" />开始排盘</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
