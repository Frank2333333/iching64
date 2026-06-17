import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Sparkles, Compass, ScrollText, Check, Save } from 'lucide-react';
import type { BaziInput } from '../../lib/bazi-api';

interface BaziFormProps {
  onSubmit: (data: BaziInput) => void;
  loading: boolean;
  initialData?: BaziInput;
  onClearInitialData?: () => void;
  onSave?: (data: BaziInput) => void;
}

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export default function BaziForm({ onSubmit, loading, initialData, onClearInitialData, onSave }: BaziFormProps) {
  const today = new Date();
  const [inputMode, setInputMode] = useState<'birthdate' | 'pillars'>('birthdate');

  // 出生日期模式
  const [year, setYear] = useState(today.getFullYear().toString());
  const [month, setMonth] = useState((today.getMonth() + 1).toString());
  const [day, setDay] = useState(today.getDate().toString());
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('0');

  // 直接八字模式
  const [yearPillar, setYearPillar] = useState({ gan: '', zhi: '' });
  const [monthPillar, setMonthPillar] = useState({ gan: '', zhi: '' });
  const [dayPillar, setDayPillar] = useState({ gan: '', zhi: '' });
  const [hourPillar, setHourPillar] = useState({ gan: '', zhi: '' });

  // 模式切换状态持久化（避免切换时丢失已填数据）
  const [savedBirthdate, setSavedBirthdate] = useState({
    year: today.getFullYear().toString(),
    month: (today.getMonth() + 1).toString(),
    day: today.getDate().toString(),
    hour: '12',
    minute: '0',
  });
  const [savedPillars, setSavedPillars] = useState({
    year: { gan: '', zhi: '' },
    month: { gan: '', zhi: '' },
    day: { gan: '', zhi: '' },
    hour: { gan: '', zhi: '' },
  });

  // 共用字段
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthplace, setBirthplace] = useState('');
  const [useSolarTime, setUseSolarTime] = useState(false);
  const [question, setQuestion] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 加载初始档案数据
  useEffect(() => {
    if (!initialData) return;

    if (initialData.pillars) {
      setInputMode('pillars');
      setYearPillar({
        gan: initialData.pillars.year.charAt(0) || '',
        zhi: initialData.pillars.year.charAt(1) || '',
      });
      setMonthPillar({
        gan: initialData.pillars.month.charAt(0) || '',
        zhi: initialData.pillars.month.charAt(1) || '',
      });
      setDayPillar({
        gan: initialData.pillars.day.charAt(0) || '',
        zhi: initialData.pillars.day.charAt(1) || '',
      });
      setHourPillar({
        gan: initialData.pillars.hour.charAt(0) || '',
        zhi: initialData.pillars.hour.charAt(1) || '',
      });
    } else if (
      initialData.year !== undefined &&
      initialData.month !== undefined &&
      initialData.day !== undefined &&
      initialData.hour !== undefined
    ) {
      setInputMode('birthdate');
      setYear(initialData.year.toString());
      setMonth(initialData.month.toString());
      setDay(initialData.day.toString());
      setHour(initialData.hour.toString());
      setMinute((initialData.minute ?? 0).toString());
    }

    setGender(initialData.gender);
    setBirthplace(initialData.birthplace || '');
    setUseSolarTime(initialData.useSolarTime || false);
    setQuestion(initialData.question || '');

    onClearInitialData?.();
  }, [initialData, onClearInitialData]);

  const handleModeChange = (mode: 'birthdate' | 'pillars') => {
    if (mode === inputMode) return;
    // 保存当前模式数据
    if (inputMode === 'birthdate') {
      setSavedBirthdate({ year, month, day, hour, minute });
    } else {
      setSavedPillars({ year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar });
    }
    setInputMode(mode);
    // 恢复目标模式数据
    if (mode === 'birthdate') {
      setYear(savedBirthdate.year);
      setMonth(savedBirthdate.month);
      setDay(savedBirthdate.day);
      setHour(savedBirthdate.hour);
      setMinute(savedBirthdate.minute);
    } else {
      setYearPillar(savedPillars.year);
      setMonthPillar(savedPillars.month);
      setDayPillar(savedPillars.day);
      setHourPillar(savedPillars.hour);
    }
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (inputMode === 'birthdate') {
      const y = parseInt(year);
      const m = parseInt(month);
      const d = parseInt(day);
      const h = parseInt(hour);
      const min = parseInt(minute);

      if (isNaN(y) || y < 1900 || y > 2100) {
        newErrors.year = '请输入有效的出生年份 (1900-2100)';
      }
      if (isNaN(m) || m < 1 || m > 12) {
        newErrors.month = '请输入有效的出生月份 (1-12)';
      }
      if (isNaN(d) || d < 1 || d > 31) {
        newErrors.day = '请输入有效的出生日期 (1-31)';
      }
      if (isNaN(h) || h < 0 || h > 23) {
        newErrors.hour = '请输入有效的小时 (0-23)';
      }
      if (isNaN(min) || min < 0 || min > 59) {
        newErrors.minute = '请输入有效的分钟 (0-59)';
      }

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
    } else {
      // 直接八字模式
      if (!yearPillar.gan || !yearPillar.zhi) {
        newErrors.yearPillar = '请选择年柱';
      }
      if (!monthPillar.gan || !monthPillar.zhi) {
        newErrors.monthPillar = '请选择月柱';
      }
      if (!dayPillar.gan || !dayPillar.zhi) {
        newErrors.dayPillar = '请选择日柱';
      }
      if (!hourPillar.gan || !hourPillar.zhi) {
        newErrors.hourPillar = '请选择时柱';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});

      onSubmit({
        gender,
        birthplace: birthplace.trim() || undefined,
        question: question.trim() || undefined,
        pillars: {
          year: yearPillar.gan + yearPillar.zhi,
          month: monthPillar.gan + monthPillar.zhi,
          day: dayPillar.gan + dayPillar.zhi,
          hour: hourPillar.gan + hourPillar.zhi,
        },
      });
    }
  };

  const PillarSelect = ({
    label,
    gan,
    zhi,
    onGanChange,
    onZhiChange,
  }: {
    label: string;
    gan: string;
    zhi: string;
    onGanChange: (v: string) => void;
    onZhiChange: (v: string) => void;
  }) => (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-amber-800 dark:text-amber-400 text-center">
        {label}
      </span>
      <select
        value={gan}
        onChange={(e) => onGanChange(e.target.value)}
        className="px-3 py-3 border border-amber-200 dark:border-amber-700/50
                 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500
                 dark:focus:ring-amber-600
                 text-amber-900 dark:text-amber-100 text-center
                 bg-white dark:bg-neutral-900
                 transition-colors"
      >
        <option value="">天干</option>
        {TIAN_GAN.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <select
        value={zhi}
        onChange={(e) => onZhiChange(e.target.value)}
        className="px-3 py-3 border border-amber-200 dark:border-amber-700/50
                 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500
                 dark:focus:ring-amber-600
                 text-amber-900 dark:text-amber-100 text-center
                 bg-white dark:bg-neutral-900
                 transition-colors"
      >
        <option value="">地支</option>
        {DI_ZHI.map((z) => (
          <option key={z} value={z}>
            {z}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="animate-slideInUp">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-md
                   border border-amber-200 dark:border-amber-900/30
                   dark:hover:border-amber-800/50 transition-colors">
        {/* 模式切换 Tab */}
        <div className="flex gap-2 mb-6 bg-amber-50 dark:bg-amber-900/20 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => handleModeChange('birthdate')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              inputMode === 'birthdate'
                ? 'bg-white dark:bg-neutral-800 text-amber-700 dark:text-amber-300 shadow-sm border border-amber-200 dark:border-amber-700/50'
                : 'text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            出生日期排盘
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('pillars')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              inputMode === 'pillars'
                ? 'bg-white dark:bg-neutral-800 text-amber-700 dark:text-amber-300 shadow-sm border border-amber-200 dark:border-amber-700/50'
                : 'text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200'
            }`}
          >
            <ScrollText className="w-4 h-4" />
            直接输入八字
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 性别选择 */}
          <div>
            <label className="block text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">
              性别
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                  gender === 'male'
                    ? 'border-amber-500 bg-amber-500 text-white dark:bg-amber-600 dark:text-white shadow-md'
                    : 'border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400 hover:border-amber-400 bg-white dark:bg-neutral-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">男</span>
                {gender === 'male' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                  gender === 'female'
                    ? 'border-amber-500 bg-amber-500 text-white dark:bg-amber-600 dark:text-white shadow-md'
                    : 'border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400 hover:border-amber-400 bg-white dark:bg-neutral-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">女</span>
                {gender === 'female' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {inputMode === 'birthdate' ? (
            <>
              {/* 出生日期 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">
                    年
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    min="1900"
                    max="2100"
                    required
                    className="w-full px-4 py-3 border border-amber-200 dark:border-amber-700/50
                             rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500
                             dark:focus:ring-amber-600
                             text-amber-900 dark:text-amber-100
                             bg-white dark:bg-neutral-900
                             transition-colors placeholder:text-amber-400 dark:placeholder:text-amber-700/50"
                  />
                  {errors.year && <p className="text-sm text-red-600 mt-1">{errors.year}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">
                    月
                  </label>
                  <input
                    type="number"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    min="1"
                    max="12"
                    required
                    className="w-full px-4 py-3 border border-amber-200 dark:border-amber-700/50
                             rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500
                             dark:focus:ring-amber-600
                             text-amber-900 dark:text-amber-100
                             bg-white dark:bg-neutral-900
                             transition-colors placeholder:text-amber-400 dark:placeholder:text-amber-700/50"
                  />
                  {errors.month && <p className="text-sm text-red-600 mt-1">{errors.month}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">
                    日
                  </label>
                  <input
                    type="number"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    min="1"
                    max="31"
                    required
                    className="w-full px-4 py-3 border border-amber-200 dark:border-amber-700/50
                             rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500
                             dark:focus:ring-amber-600
                             text-amber-900 dark:text-amber-100
                             bg-white dark:bg-neutral-900
                             transition-colors placeholder:text-amber-400 dark:placeholder:text-amber-700/50"
                  />
                  {errors.day && <p className="text-sm text-red-600 mt-1">{errors.day}</p>}
                </div>
              </div>

              {/* 出生时间 */}
              <div>
                <label className="block text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  出生时间
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={hour}
                      onChange={(e) => setHour(e.target.value)}
                      min="0"
                      max="23"
                      required
                      placeholder="时"
                      className="w-full px-4 py-3 border border-amber-200 dark:border-amber-700/50
                               rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500
                               dark:focus:ring-amber-600
                               text-amber-900 dark:text-amber-100
                               bg-white dark:bg-neutral-900
                               transition-colors placeholder:text-amber-400 dark:placeholder:text-amber-700/50"
                    />
                    {errors.hour && <p className="text-sm text-red-600 mt-1">{errors.hour}</p>}
                  </div>
                  <div className="flex items-center text-amber-600 dark:text-amber-400 text-lg">:</div>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={minute}
                      onChange={(e) => setMinute(e.target.value)}
                      min="0"
                      max="59"
                      required
                      placeholder="分"
                      className="w-full px-4 py-3 border border-amber-200 dark:border-amber-700/50
                               rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500
                               dark:focus:ring-amber-600
                               text-amber-900 dark:text-amber-100
                               bg-white dark:bg-neutral-900
                               transition-colors placeholder:text-amber-400 dark:placeholder:text-amber-700/50"
                    />
                    {errors.minute && <p className="text-sm text-red-600 mt-1">{errors.minute}</p>}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ScrollText className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">输入八字四柱</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <PillarSelect
                  label="年柱"
                  gan={yearPillar.gan}
                  zhi={yearPillar.zhi}
                  onGanChange={(v) => setYearPillar((p) => ({ ...p, gan: v }))}
                  onZhiChange={(v) => setYearPillar((p) => ({ ...p, zhi: v }))}
                />
                <PillarSelect
                  label="月柱"
                  gan={monthPillar.gan}
                  zhi={monthPillar.zhi}
                  onGanChange={(v) => setMonthPillar((p) => ({ ...p, gan: v }))}
                  onZhiChange={(v) => setMonthPillar((p) => ({ ...p, zhi: v }))}
                />
                <PillarSelect
                  label="日柱"
                  gan={dayPillar.gan}
                  zhi={dayPillar.zhi}
                  onGanChange={(v) => setDayPillar((p) => ({ ...p, gan: v }))}
                  onZhiChange={(v) => setDayPillar((p) => ({ ...p, zhi: v }))}
                />
                <PillarSelect
                  label="时柱"
                  gan={hourPillar.gan}
                  zhi={hourPillar.zhi}
                  onGanChange={(v) => setHourPillar((p) => ({ ...p, gan: v }))}
                  onZhiChange={(v) => setHourPillar((p) => ({ ...p, zhi: v }))}
                />
              </div>
              {(errors.yearPillar || errors.monthPillar || errors.dayPillar || errors.hourPillar) && (
                <p className="text-sm text-red-600 mt-2">
                  {errors.yearPillar || errors.monthPillar || errors.dayPillar || errors.hourPillar}
                </p>
              )}
              {onSave && (
                <button
                  type="button"
                  onClick={() => {
                    onSave({
                      gender,
                      birthplace: birthplace.trim() || undefined,
                      question: question.trim() || undefined,
                      pillars: {
                        year: yearPillar.gan + yearPillar.zhi,
                        month: monthPillar.gan + monthPillar.zhi,
                        day: dayPillar.gan + dayPillar.zhi,
                        hour: hourPillar.gan + hourPillar.zhi,
                      },
                    });
                  }}
                  disabled={!yearPillar.gan || !yearPillar.zhi || !monthPillar.gan || !monthPillar.zhi || !dayPillar.gan || !dayPillar.zhi || !hourPillar.gan || !hourPillar.zhi}
                  className="w-full py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存此八字
                </button>
              )}
            </div>
          )}

          {/* 出生地点 */}
          <div>
            <label className="block text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              出生地点（选填）
            </label>
            <input
              type="text"
              value={birthplace}
              onChange={(e) => setBirthplace(e.target.value)}
              placeholder="例如：北京市"
              className="w-full px-4 py-3 border border-amber-200 dark:border-amber-700/50
                       rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500
                       dark:focus:ring-amber-600
                       text-amber-900 dark:text-amber-100
                       bg-white dark:bg-neutral-900
                       transition-colors placeholder:text-amber-400 dark:placeholder:text-amber-700/50"
            />
          </div>

          {/* 真太阳时选项 - 仅出生日期模式显示 */}
          {inputMode === 'birthdate' && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="solarTime"
                checked={useSolarTime}
                onChange={(e) => setUseSolarTime(e.target.checked)}
                className="w-4 h-4 text-amber-600 border-amber-300 rounded
                         focus:ring-amber-500 dark:focus:ring-amber-600
                         dark:border-amber-700"
              />
              <label htmlFor="solarTime" className="text-sm text-amber-700 dark:text-amber-400 cursor-pointer">
                使用真太阳时（根据经度校正）
              </label>
            </div>
          )}

          {/* 用户问题 */}
          <div>
            <label className="block text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">
              <Sparkles className="w-4 h-4 inline mr-1" />
              您想咨询的问题（选填）
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例如：我想了解我的事业发展方向..."
              rows={3}
              className="w-full px-4 py-3 border border-amber-200 dark:border-amber-700/50
                       rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500
                       dark:focus:ring-amber-600
                       text-amber-900 dark:text-amber-100
                       bg-white dark:bg-neutral-900
                       transition-colors placeholder:text-amber-400 dark:placeholder:text-amber-700/50
                       resize-none"
            />
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600
                     hover:from-amber-700 hover:to-orange-700
                     dark:from-amber-500 dark:to-orange-500 dark:hover:from-amber-400 dark:hover:to-orange-400
                     text-white dark:text-neutral-900 font-bold rounded-lg transition-all shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0
                     flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                正在排盘中...
              </>
            ) : (
              <>
                <Compass className="w-5 h-5" />
                开始排盘
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
