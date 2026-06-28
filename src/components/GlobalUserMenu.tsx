import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, ChevronDown, Trash2, LogIn, LogOut, Upload, Files, Crown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import LoginDialog from './auth/LoginDialog';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

const triggerClass =
  'inline-flex items-center gap-1.5 rounded-full border border-[#E7D6C8] bg-white/84 px-3 py-2.5 text-sm font-medium text-[#7B5C50] shadow-[0_12px_28px_-24px_rgba(120,74,49,0.5)] backdrop-blur-sm transition-all duration-300 hover:border-[#D7B7A4] hover:text-[#B56F62] dark:border-white/10 dark:bg-neutral-950/68 dark:text-yellow-100/82 dark:shadow-none dark:hover:border-yellow-500/30 dark:hover:text-yellow-50';

export default function GlobalUserMenu() {
  const { user, isLoggedIn, login, logout } = useAuth();
  const {
    profiles,
    currentProfileId,
    setCurrentProfileId,
    deleteProfile,
    uploadLocalToCloud,
  } = useProfile();
  const [loginOpen, setLoginOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const localCount = profiles.filter((p) => p.source === 'local').length;
  const currentProfile = profiles.find((p) => p.id === currentProfileId) ?? null;
  const triggerLabel = currentProfile ? currentProfile.name : '档案';

  const handleUpload = async () => {
    setUploading(true);
    const n = await uploadLocalToCloud();
    setUploading(false);
    if (n > 0) alert(`已上传 ${n} 个档案到云端`);
    else alert('没有可上传的本地档案');
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`删除档案「${name}」？`)) deleteProfile(id);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={triggerClass} aria-label="档案与账户">
            {isLoggedIn ? <User className="h-4 w-4" /> : <Files className="h-4 w-4" />}
            <span className="max-w-[72px] truncate">{triggerLabel}</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>档案</DropdownMenuLabel>
          {profiles.length === 0 && (
            <div className="px-2 py-3 text-sm text-muted-foreground">
              暂无档案，在八字/紫微排盘页保存
            </div>
          )}
          {profiles.map((p) => (
            <div key={p.id} className="group flex items-center pr-1">
              <button
                className={`flex-1 truncate rounded-sm px-2 py-2 text-left text-sm hover:bg-accent ${
                  currentProfileId === p.id ? 'bg-accent font-medium' : ''
                }`}
                onClick={() => setCurrentProfileId(p.id)}
              >
                <span className="truncate">{p.name}</span>
                {p.source === 'local' && (
                  <span className="ml-1.5 rounded bg-amber-100 px-1 py-0.5 text-[10px] text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    本地
                  </span>
                )}
                {p.inputMode === 'pillars' && (
                  <span className="ml-1.5 rounded bg-neutral-100 px-1 py-0.5 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    仅八字
                  </span>
                )}
              </button>
              <button
                className="p-1 text-muted-foreground opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                onClick={() => handleDelete(p.id, p.name)}
                aria-label={`删除${p.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {isLoggedIn && localCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleUpload} disabled={uploading}>
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? '上传中...' : `上传本地档案到云端 (${localCount})`}
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          {isLoggedIn ? (
            <>
              <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                {user?.email}
              </DropdownMenuLabel>
              {user?.plan === 'member' ? (
                <DropdownMenuItem disabled>
                  <Crown className="mr-2 h-4 w-4 text-amber-500" />
                  会员{user?.memberExpiresAt ? ` · ${new Date(user.memberExpiresAt).toLocaleDateString('zh-CN')}到期` : ''}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/upgrade">
                    <Crown className="mr-2 h-4 w-4 text-amber-500" />
                    升级会员
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => setLoginOpen(true)}>
              <LogIn className="mr-2 h-4 w-4" />
              登录 / 注册
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} onLogin={login} />
    </>
  );
}
