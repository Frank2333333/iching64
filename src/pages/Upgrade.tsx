import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, ArrowLeft } from 'lucide-react';
import MainHeaderTabs from '../components/MainHeaderTabs';
import { useAuth } from '../context/AuthContext';
import { getAuthToken } from '../lib/api-auth';

const API_BASE_URL = import.meta.env.VITE_FEEDBACK_API_URL || '/api';

// 与后端 QUOTA 对应的展示（后端是权威，这里仅展示用）
const PLAN_FEATURES = [
  { label: '人物档案', free: '3 个', member: '5 个' },
  { label: '人生报告', free: '1 次/天', member: '3 次/天' },
  { label: 'AI 对话', free: '10 次/天', member: '30 次/天' },
  { label: '报告云端同步', free: '✓', member: '✓' },
  { label: '跨设备同步', free: '✓', member: '✓' },
];

const PLANS = [
  { id: 'monthly' as const, name: '包月', price: '19', unit: '/月', desc: '灵活订阅，随时取消' },
  { id: 'yearly' as const, name: '包年', price: '128', unit: '/年', desc: '约 5 折，年均 10.6/月' },
];

export default function Upgrade() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [creating, setCreating] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const isMember = user?.plan === 'member';
  const expiresAt = user?.memberExpiresAt;

  const handleCreateOrder = async (plan: 'monthly' | 'yearly') => {
    setNotice(null);
    const token = getAuthToken();
    if (!token) {
      setNotice('请先登录');
      return;
    }
    setCreating(plan);
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (json.success) {
        setNotice(json.data?.notice || '支付渠道正在接入中，暂无法自助开通。如需开通请联系站长。');
        await refreshUser();
      } else {
        setNotice(json.error || '创建订单失败');
      }
    } catch {
      setNotice('网络请求失败');
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F3] via-[#FFFDFC] to-[#F7EFE7]
                    dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
                    iching-pattern-bg iching-cloud-bg transition-colors duration-500">
      <header className="sticky top-0 z-50 border-b border-[#E8D7CA]/70 bg-[#FFF8F3]/82 text-[#4B3A33]
                         shadow-[0_14px_45px_-34px_rgba(107,74,58,0.45)] backdrop-blur-xl transition-colors duration-500
                         dark:border-white/10 dark:bg-neutral-950/80 dark:text-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#6B5549] dark:text-yellow-200 hover:opacity-80">
              <ArrowLeft className="w-4 h-4" />返回
            </button>
            <h1 className="text-lg font-display font-semibold tracking-[0.14em] text-[#4B3A33] dark:text-yellow-50 whitespace-nowrap">
              升级会员
            </h1>
            <MainHeaderTabs />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* 当前状态 */}
        {isMember && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-700/40 dark:from-amber-900/20 dark:to-orange-900/10 p-5 text-center">
            <Crown className="w-6 h-6 mx-auto text-amber-600 dark:text-amber-400 mb-2" />
            <p className="font-display font-bold text-amber-900 dark:text-amber-100">已是会员</p>
            {expiresAt && (
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                有效期至：{new Date(expiresAt).toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>
        )}

        {/* 标题 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-bold text-[#4B3A33] dark:text-yellow-100">解锁更多命理探索</h2>
          <p className="mt-2 text-sm text-[#8A6658] dark:text-yellow-200/70">更多档案、更多报告、更多 AI 对话，深入你的命盘</p>
        </div>

        {/* 功能对比 */}
        <div className="mb-8 rounded-2xl border border-[#E9D8C8] dark:border-yellow-900/30 bg-white/80 dark:bg-neutral-900/50 overflow-hidden shadow-card">
          <div className="grid grid-cols-3">
            <div className="p-4 text-sm font-medium text-[#6B5549] dark:text-yellow-200/70">功能</div>
            <div className="p-4 text-center text-sm font-medium text-[#8A6658] dark:text-yellow-400">免费</div>
            <div className="p-4 text-center text-sm font-display font-bold text-[#C97C6D] dark:text-yellow-300 bg-amber-50/50 dark:bg-amber-900/10">会员</div>
          </div>
          {PLAN_FEATURES.map((f) => (
            <div key={f.label} className="grid grid-cols-3 border-t border-[#E9D8C8]/60 dark:border-yellow-900/20">
              <div className="p-4 text-sm text-[#4B3A33] dark:text-yellow-100">{f.label}</div>
              <div className="p-4 text-center text-sm text-[#8A6658] dark:text-yellow-200/70">{f.free}</div>
              <div className="p-4 text-center text-sm font-medium text-[#4B3A33] dark:text-yellow-100 bg-amber-50/50 dark:bg-amber-900/10">{f.member}</div>
            </div>
          ))}
        </div>

        {/* 套餐 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLANS.map((p) => (
            <div key={p.id} className="rounded-2xl border-2 border-[#E9D8C8] dark:border-yellow-900/30 bg-white/80 dark:bg-neutral-900/50 p-6 shadow-card flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                {p.id === 'yearly' && <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                <h3 className="text-lg font-display font-bold text-[#4B3A33] dark:text-yellow-100">{p.name}</h3>
                {p.id === 'yearly' && <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">推荐</span>}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-display font-bold text-[#C97C6D] dark:text-yellow-300">¥{p.price}</span>
                <span className="text-sm text-[#8A6658] dark:text-yellow-400">{p.unit}</span>
              </div>
              <p className="text-xs text-[#8A6658] dark:text-yellow-200/60 mb-4">{p.desc}</p>
              <button
                onClick={() => handleCreateOrder(p.id)}
                disabled={creating !== null || isMember}
                className="mt-auto w-full py-3 rounded-xl bg-gradient-to-r from-[#C97C6D] to-[#D8B38A] dark:from-yellow-600 dark:to-yellow-700
                           text-white dark:text-neutral-900 font-display font-bold disabled:opacity-50 disabled:cursor-not-allowed
                           hover:shadow-lg transition-all"
              >
                {creating === p.id ? '创建订单中...' : isMember ? '当前为会员' : `开通${p.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* 提示 */}
        {notice && (
          <div className="mt-6 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/80 dark:bg-amber-900/15 p-4 text-center text-sm text-amber-800 dark:text-amber-200">
            {notice}
          </div>
        )}
        <p className="mt-6 text-center text-xs text-[#B79A86] dark:text-yellow-200/40">
          <Check className="inline w-3 h-3 mr-1" />会员到期自动恢复免费额度，不会自动扣费
        </p>
      </main>
    </div>
  );
}
