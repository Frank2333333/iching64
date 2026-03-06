import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllFeedback,
  clearAllFeedback,
  type FeedbackItem,
  type FeedbackType,
} from '@/components/FeedbackButton';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Trash2,
  Download,
  MessageSquare,
  Calendar,
  Link2,
  Search,
  User,
  AlertTriangle,
  Eye,
  X,
} from 'lucide-react';

// 管理员密码（简单保护）
const ADMIN_PASSWORD = 'iching64-admin';

const feedbackTypeLabels: Record<FeedbackType, string> = {
  feature: '✨ 功能建议',
  bug: '🐛 Bug 反馈',
  ui: '🎨 界面优化',
  content: '📚 内容建议',
  other: '💬 其他',
};

const feedbackTypeColors: Record<FeedbackType, string> = {
  feature: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  bug: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  ui: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  content: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

export default function FeedbackAdmin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [filterType, setFilterType] = useState<FeedbackType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  // 加载反馈数据
  useEffect(() => {
    if (isAuthenticated) {
      setFeedbackList(getAllFeedback());
    }
  }, [isAuthenticated]);

  // 验证密码
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  // 过滤和搜索
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((item) => {
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesSearch =
        searchQuery === '' ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.contact && item.contact.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [feedbackList, filterType, searchQuery]);

  // 导出反馈
  const handleExport = () => {
    const dataStr = JSON.stringify(feedbackList, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iching64-feedback-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 清空反馈
  const handleClear = () => {
    clearAllFeedback();
    setFeedbackList([]);
    setIsClearDialogOpen(false);
  };

  // 格式化时间
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 登录界面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 
                      dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
                      flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm
                        border-amber-200 dark:border-yellow-900/50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-yellow-900/30 
                          flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-yellow-500" />
            </div>
            <CardTitle className="text-2xl text-amber-900 dark:text-yellow-100">
              管理员验证
            </CardTitle>
            <CardDescription className="text-amber-700/70 dark:text-yellow-200/60">
              请输入密码访问反馈管理后台
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="bg-amber-50/50 dark:bg-neutral-800 border-amber-200 dark:border-yellow-900/50
                       text-amber-900 dark:text-yellow-100 text-center text-lg tracking-widest"
            />
            {passwordError && (
              <p className="text-sm text-red-500 text-center">密码错误</p>
            )}
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 
                       hover:from-amber-700 hover:to-amber-800
                       dark:from-yellow-600 dark:to-yellow-700 dark:hover:from-yellow-700 dark:hover:to-yellow-800
                       text-white"
            >
              进入后台
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full text-amber-700 dark:text-yellow-600 hover:text-amber-900 
                       dark:hover:text-yellow-400 hover:bg-amber-100 dark:hover:bg-yellow-900/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 
                    dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-900 via-red-900 to-amber-900 
                       dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 
                       text-amber-50 dark:text-yellow-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-6 h-6 text-amber-300" />
              <h1 className="text-xl font-bold">反馈管理后台</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-amber-200 hover:text-white hover:bg-amber-800/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计和操作栏 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/80 dark:bg-neutral-900/80 border-amber-200 dark:border-yellow-900/50">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-amber-900 dark:text-yellow-400">
                {feedbackList.length}
              </div>
              <div className="text-sm text-amber-600 dark:text-yellow-600">总反馈数</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-neutral-900/80 border-amber-200 dark:border-yellow-900/50 md:col-span-3">
            <CardContent className="p-4 flex flex-wrap gap-3 items-center">
              {/* 类型过滤 */}
              <Select value={filterType} onValueChange={(v) => setFilterType(v as FeedbackType | 'all')}>
                <SelectTrigger className="w-40 bg-amber-50/50 dark:bg-neutral-800 
                                        border-amber-200 dark:border-yellow-900/50">
                  <SelectValue placeholder="全部类型" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-neutral-900">
                  <SelectItem value="all">全部类型</SelectItem>
                  {(Object.keys(feedbackTypeLabels) as FeedbackType[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {feedbackTypeLabels[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 搜索 */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                <Input
                  placeholder="搜索内容或联系方式..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-amber-50/50 dark:bg-neutral-800 
                           border-amber-200 dark:border-yellow-900/50"
                />
              </div>

              {/* 操作按钮 */}
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={feedbackList.length === 0}
                className="border-amber-300 dark:border-yellow-700 
                         text-amber-700 dark:text-yellow-400
                         hover:bg-amber-100 dark:hover:bg-yellow-900/30"
              >
                <Download className="w-4 h-4 mr-2" />
                导出
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsClearDialogOpen(true)}
                disabled={feedbackList.length === 0}
                className="border-red-300 dark:border-red-700 
                         text-red-600 dark:text-red-400
                         hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清空
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 反馈列表 */}
        {filteredFeedback.length === 0 ? (
          <Card className="bg-white/80 dark:bg-neutral-900/80 border-amber-200 dark:border-yellow-900/50">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-amber-300 dark:text-yellow-700 mb-4" />
              <p className="text-amber-600 dark:text-yellow-600">
                {feedbackList.length === 0 ? '暂无反馈数据' : '没有符合条件的反馈'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredFeedback.map((item) => (
              <Card
                key={item.id}
                className="bg-white/80 dark:bg-neutral-900/80 border-amber-200 dark:border-yellow-900/50
                         hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setSelectedFeedback(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          className={feedbackTypeColors[item.type]}
                        >
                          {feedbackTypeLabels[item.type]}
                        </Badge>
                        <span className="text-xs text-amber-500/60 dark:text-yellow-600/60">
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-amber-900 dark:text-yellow-100 line-clamp-2 text-sm">
                        {item.content}
                      </p>
                      {item.contact && (
                        <p className="text-xs text-amber-600/70 dark:text-yellow-600/70 mt-2 flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {item.contact}
                        </p>
                      )}
                    </div>
                    <Eye className="w-5 h-5 text-amber-400/50 dark:text-yellow-600/50 
                                  group-hover:text-amber-600 dark:group-hover:text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* 详情弹窗 */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl bg-white dark:bg-neutral-900 
                                border-amber-200 dark:border-yellow-900/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-900 dark:text-yellow-100">
              <Badge
                variant="secondary"
                className={selectedFeedback ? feedbackTypeColors[selectedFeedback.type] : ''}
              >
                {selectedFeedback && feedbackTypeLabels[selectedFeedback.type]}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              {/* 内容 */}
              <div className="bg-amber-50/50 dark:bg-neutral-800 rounded-lg p-4">
                <p className="text-amber-900 dark:text-yellow-100 whitespace-pre-wrap">
                  {selectedFeedback.content}
                </p>
              </div>

              {/* 元信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-amber-700 dark:text-yellow-200/70">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedFeedback.timestamp)}</span>
                </div>
                {selectedFeedback.contact && (
                  <div className="flex items-center gap-2 text-amber-700 dark:text-yellow-200/70">
                    <User className="w-4 h-4" />
                    <span>{selectedFeedback.contact}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-amber-700 dark:text-yellow-200/70 md:col-span-2">
                  <Link2 className="w-4 h-4" />
                  <span className="truncate">{selectedFeedback.url}</span>
                </div>
              </div>

              {/* 浏览器信息 */}
              <div className="text-xs text-amber-500/60 dark:text-yellow-600/60 bg-neutral-100 
                            dark:bg-neutral-800 rounded p-2 break-all">
                {selectedFeedback.userAgent}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setSelectedFeedback(null)}
              className="bg-amber-600 hover:bg-amber-700 dark:bg-yellow-600 dark:hover:bg-yellow-700"
            >
              <X className="w-4 h-4 mr-2" />
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 清空确认弹窗 */}
      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent className="bg-white dark:bg-neutral-900 border-amber-200 dark:border-yellow-900/50">
          <DialogHeader>
            <DialogTitle className="text-amber-900 dark:text-yellow-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              确认清空
            </DialogTitle>
            <DialogDescription className="text-amber-700 dark:text-yellow-200/70">
              此操作将删除所有反馈数据，无法恢复。是否继续？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsClearDialogOpen(false)}
              className="border-amber-300 dark:border-yellow-700"
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleClear}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              确认清空
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
