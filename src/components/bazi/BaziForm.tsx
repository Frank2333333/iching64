import { useState } from 'react';
import { Calendar, Clock, MapPin, User, Sparkles, Compass, ScrollText } from 'lucide-react';
import type { BaziInput } from '../../lib/bazi-api';

interface BaziFormProps {
  onSubmit: (data: BaziInput) => void;
  loading: boolean;
}

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export default function BaziForm({ onSubmit, loading }: BaziFormProps) {
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

  // 共用字段
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthplace, setBirthplace] = useState('');
  const [useSolarTime, setUseSolarTime] = useState(false);
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputMode === 'birthdate') {
      const y = parseInt(year);
      const m = parseInt(month);
      const d = parseInt(day);
      const h = parseInt(hour);
      const min = parseInt(minute);

      if (isNaN(y) || y < 1900 || y > 2100) {
        alert('请输入有效的出生年份 (1900-2100)');
        return;
      }
      if (isNaN(m) || m < 1 || m > 12) {
        alert('请输入有效的出生月份 (1-12)');
        return;
      }
      if (isNaN(d) || d < 1 || d > 31) {
        alert('请输入有效的出生日期 (1-31)');
        return;
      }
      if (isNaN(h) || h < 0 || h > 23) {
        alert('请输入有效的小时 (0-23)');
        return;
      }
      if (isNaN(min) || min < 0 || min > 59) {
        alert('请输入有效的分钟 (0-59)');
        return;
      }

      const date = new Date(y, m - 1, d);
      if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
        alert('输入的日期无效');
        return;
      }

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
        alert('请选择年柱');
        return;
      }
      if (!monthPillar.gan || !monthPillar.zhi) {
        alert('请选择月柱');
        return;
      }
      if (!dayPillar.gan || !dayPillar.zhi) {
        alert('请选择日柱');
        return;
      }
      if (!hourPillar.gan || !hourPillar.zhi) {
        alert('请选择时柱');
        return;
      }

      onSubmit({
        year: 2000,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
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
      <span className="text-sm font-medium text-amber-800 dark:text-amber-400">{label}</span>
      <div className="flex gap-2">
        <select
          value={gan}
          onChange={(e) => onGanChange(e.target.value)}
          className="flex-1 px-3 py-3 border border-amber-200 dark:border-amber-700/50
                   rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500
                   dark:focus:ring-amber-600
                   text-amber-900 dark:text-amber-100
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
          className="flex-1 px-3 py-3 border border-amber-200 dark:border-amber-700/50
                   rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500
                   dark:focus:ring-amber-600
                   text-amber-900 dark:text-amber-100
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
            onClick={() => setInputMode('birthdate')}
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
            onClick={() => setInputMode('pillars')}
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
                    ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400 hover:border-amber-400'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">男</span>
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                  gender === 'female'
                    ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400 hover:border-amber-400'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">女</span>
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
              <div className="grid grid-cols-2 gap-4">
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
