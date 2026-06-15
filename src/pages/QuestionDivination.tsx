import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateMeihuaResult, type DivinationResult } from '../lib/meihua-divination';
import { buildInitialInterpretationSummary } from '../lib/chat-summary';
import {
  ArrowLeft, HelpCircle, Briefcase, Heart,
  Activity, Coins, GraduationCap, Plane, Scale,
  ChevronRight, Search
} from 'lucide-react';
import { useScrollPosition } from '../hooks/useScrollPosition';
import MainHeaderTabs from '../components/MainHeaderTabs';
import { getAIDivination, checkAIDivinationStatus, sendChatMessage, type DivinationData, type ChatMessage } from '../lib/ai-divination-api';
import GuaDetailView from '../components/divination/GuaDetailView';
import ChatPanel from '../components/divination/ChatPanel';
import DivinationForm from '../components/divination/DivinationForm';
import SceneSelector from '../components/divination/SceneSelector';
import GuaOverview from '../components/divination/GuaOverview';
import GuaAnalysisPanel from '../components/divination/GuaAnalysisPanel';
import AIInterpretationPanel from '../components/divination/AIInterpretationPanel';

// 问事场景类型
interface QuestionScene {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  bgColor: string;
}

// 定义问事场景
const questionScenes: QuestionScene[] = [
  {
    id: 'career',
    name: '事业前程',
    icon: <Briefcase className="w-6 h-6" />,
    description: '问工作变动、升职、创业、职场关系',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30',
  },
  {
    id: 'relationship',
    name: '感情姻缘',
    icon: <Heart className="w-6 h-6" />,
    description: '问恋爱、婚姻、感情发展、桃花',
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800/30',
  },
  {
    id: 'health',
    name: '健康疾病',
    icon: <Activity className="w-6 h-6" />,
    description: '问身体状况、疾病康复、养生',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30',
  },
  {
    id: 'wealth',
    name: '财运投资',
    icon: <Coins className="w-6 h-6" />,
    description: '问财运、投资、买卖、借贷',
    color: 'text-[#8A6658] dark:text-amber-400',
    bgColor: 'bg-[#FFF8F3] dark:bg-amber-900/20 border-[#E9D8C8] dark:border-amber-800/30',
  },
  {
    id: 'study',
    name: '学业考试',
    icon: <GraduationCap className="w-6 h-6" />,
    description: '问考试、升学、学习、竞赛',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30',
  },
  {
    id: 'travel',
    name: '出行迁移',
    icon: <Plane className="w-6 h-6" />,
    description: '问出行、搬家、旅行、迁居',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800/30',
  },
  {
    id: 'legal',
    name: '官司诉讼',
    icon: <Scale className="w-6 h-6" />,
    description: '问诉讼、纠纷、是非、调解',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30',
  },
  {
    id: 'lost',
    name: '寻物失物',
    icon: <Search className="w-6 h-6" />,
    description: '问失物寻找、失而复得',
    color: 'text-[#8A6658] dark:text-orange-400',
    bgColor: 'bg-[#FFF8F3] dark:bg-orange-900/20 border-[#E9D8C8] dark:border-orange-800/30',
  },
];

interface ChatContextSummary {
  initialInterpretationSummary: string;
  createdAt: number;
}

export default function QuestionDivination() {
  const navigate = useNavigate();
  // 步骤管理: 'select' | 'divinate' | 'result' | 'detail'
  const [step, setStep] = useState<'select' | 'divinate' | 'result' | 'detail'>('select');
  const [selectedScene, setSelectedScene] = useState<QuestionScene | null>(null);
  
  // 起卦状态
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [num3, setNum3] = useState('');
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [questionContent, setQuestionContent] = useState(''); // 用户输入的具体问事内容
  
  // 移动端菜单状态

  // AI 解卦状态
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);

  // AI 对话状态
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatContextSummary, setChatContextSummary] = useState<ChatContextSummary | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  // 检查 AI 服务状态
  useEffect(() => {
    checkAIDivinationStatus().then(setAiAvailable);
  }, []);

  // 记住滚动位置
  useScrollPosition(`question-divination-${step}`);

  const resetChatContext = () => {
    setChatMessages([]);
    setChatInput('');
    setChatLoading(false);
    setChatError(null);
    setChatContextSummary(null);
  };

  // 生成随机数
  const generateRandomNumbers = () => {
    setNum1(Math.floor(Math.random() * 900 + 100).toString());
    setNum2(Math.floor(Math.random() * 900 + 100).toString());
    setNum3(Math.floor(Math.random() * 900 + 100).toString());
  };

  // 选择场景
  const handleSelectScene = (scene: QuestionScene) => {
    setSelectedScene(scene);
    setStep('divinate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 返回选择场景
  const handleBackToScene = () => {
    setStep('select');
    setSelectedScene(null);
    setResult(null);
    setNum1('');
    setNum2('');
    setNum3('');
    setQuestionContent('');
    setAiError(null);
    setDetailsExpanded(false);
    resetChatContext();
  };

  // 返回起卦页面
  const handleBackToDivinate = () => {
    setStep('divinate');
    setResult(null);
    setAiError(null);
    setDetailsExpanded(false);
    resetChatContext();
  };

  // 开始起卦计算
  const handleCalculate = () => {
    const n1 = parseInt(num1);
    const n2 = parseInt(num2);
    const n3 = parseInt(num3);

    // 验证输入是否为有效的三位数字
    if (isNaN(n1) || n1 < 100 || n1 > 999) {
      alert('请输入有效的三位数字（100-999）作为第一个数字');
      return;
    }
    if (isNaN(n2) || n2 < 100 || n2 > 999) {
      alert('请输入有效的三位数字（100-999）作为第二个数字');
      return;
    }
    if (isNaN(n3) || n3 < 100 || n3 > 999) {
      alert('请输入有效的三位数字（100-999）作为第三个数字');
      return;
    }

    setAiError(null);
    setDetailsExpanded(false);
    resetChatContext();
    setIsCalculating(true);

    setTimeout(() => {
      const divinationResult = calculateMeihuaResult(n1, n2, n3);
      setResult(divinationResult);
      setIsCalculating(false);
      setStep('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  };

  // 查看卦象详情
  const handleShowDetail = () => {
    setStep('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 重新开始
  const handleRestart = () => {
    setStep('select');
    setSelectedScene(null);
    setResult(null);
    setNum1('');
    setNum2('');
    setNum3('');
    setQuestionContent('');
    setAiError(null);
    setDetailsExpanded(false);
    resetChatContext();
  };

  // AI 解卦
  const handleGoHome = () => {
    handleRestart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/');
  };

  const handleAIInterpretation = async () => {
    if (!result || aiLoading) return;
    
    // 如果已经有 AI 解卦结果，直接显示
    if (result.aiInterpretation) {
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const divinationData: DivinationData = {
        gua: result.gua,
        dongYao: result.dongYao,
        tiGuaName: result.tiGuaName,
        yongGuaName: result.yongGuaName,
        wuxingDetail: result.wuxingDetail,
        huGua: result.huGua,
        bianGua: result.bianGua,
        yingQi: result.yingQi,
        selectedScene: selectedScene || undefined,
        questionContent: questionContent || undefined,
      };

      const response = await getAIDivination(divinationData);

      if (response.success && response.data) {
            const initialInterpretationSummary = buildInitialInterpretationSummary(
          result,
          response.data.interpretation,
          selectedScene,
          questionContent
        );

        setResult({
          ...result,
          aiInterpretation: {
            content: response.data.interpretation,
            model: response.data.model,
            timestamp: response.data.timestamp,
          },
        });
        setChatContextSummary({
          initialInterpretationSummary,
          createdAt: response.data.timestamp,
        });
        setChatMessages([]);
        setChatInput('');
        setChatError(null);
      } else {
        setAiError(response.error || 'AI 解卦失败');
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : '请求失败');
    } finally {
      setAiLoading(false);
    }
  };

  // 发送对话消息
  const handleSendChatMessage = async () => {
    if (!result || !chatInput.trim() || chatLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput.trim(),
      timestamp: Date.now(),
    };

    // 添加用户消息到历史
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);
    setChatError(null);

    try {
      const divinationData: DivinationData = {
        gua: result.gua,
        dongYao: result.dongYao,
        tiGuaName: result.tiGuaName,
        yongGuaName: result.yongGuaName,
        wuxingDetail: result.wuxingDetail,
        huGua: result.huGua,
        bianGua: result.bianGua,
        yingQi: result.yingQi,
        selectedScene: selectedScene || undefined,
        questionContent: questionContent || undefined,
      };

      const response = await sendChatMessage({
        message: userMessage.content,
        divinationData,
        history: chatMessages.slice(-8),
        initialInterpretationSummary: chatContextSummary?.initialInterpretationSummary,
      });

      if (response.success && response.data) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.message,
          timestamp: response.data.timestamp,
        };
        setChatMessages([...newMessages, assistantMessage]);
      } else {
        setChatError(response.error || '发送失败');
        // 恢复用户输入
        setChatInput(userMessage.content);
        setChatMessages(chatMessages);
      }
    } catch (error) {
      setChatError(error instanceof Error ? error.message : '请求失败');
      // 恢复用户输入
      setChatInput(userMessage.content);
      setChatMessages(chatMessages);
    } finally {
      setChatLoading(false);
    }
  };

  // 处理回车键发送
  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F3] via-[#FFFDFC] to-[#F7EFE7] 
                  dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
                  iching-pattern-bg iching-cloud-bg transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#E8D7CA]/70 bg-[#FFF8F3]/82 text-[#4B3A33]
                       shadow-[0_14px_45px_-34px_rgba(107,74,58,0.45)] backdrop-blur-xl transition-colors duration-500
                       dark:border-white/10 dark:bg-neutral-950/80 dark:text-yellow-50 dark:shadow-[0_18px_48px_-36px_rgba(250,204,21,0.12)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <button
              type="button"
              onClick={handleGoHome}
              className="flex items-center gap-3 rounded-full transition-opacity duration-300 hover:opacity-85"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/76
                            text-[#C97C6D] shadow-[0_14px_28px_-22px_rgba(146,64,14,0.35)]
                            dark:border-white/10 dark:bg-neutral-950/65 dark:text-yellow-300 dark:shadow-none">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold tracking-[0.14em] text-[#4B3A33] dark:text-yellow-50 sm:text-xl">
                  问事解卦
                </h1>
              </div>
            </button>
            <MainHeaderTabs />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-8 ${
        step === 'select' ? 'max-w-5xl' : 'max-w-4xl'
      }`}>
        {/* Slogan */}
        <div className="text-center mb-8 animate-fadeIn">
          <p className="text-xl md:text-2xl font-serif text-[#5A463E] dark:text-yellow-300/90 tracking-wider italic">
            "观天之道，执天之行，尽矣。"
          </p>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${
              step === 'select' 
                ? 'bg-[#C97C6D] text-white dark:bg-yellow-600 dark:text-neutral-900' 
                : 'bg-[#F3E7DC] text-[#6B5549] dark:bg-yellow-900/30 dark:text-yellow-500'
            }`}>
              1
            </div>
            <span className={`text-sm ${step === 'select' ? 'text-[#4B3A33] dark:text-yellow-100' : 'text-[#8A6658] dark:text-yellow-600'}`}>
              选场景
            </span>
            <ChevronRight className="w-4 h-4 text-[#B79A86] dark:text-yellow-700" />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${
              step === 'divinate' 
                ? 'bg-[#C97C6D] text-white dark:bg-yellow-600 dark:text-neutral-900' 
                : step === 'result' || step === 'detail'
                ? 'bg-[#F3E7DC] text-[#6B5549] dark:bg-yellow-900/30 dark:text-yellow-500'
                : 'bg-[#F8EEE5] text-[#B79A86] dark:bg-neutral-800 dark:text-neutral-600'
            }`}>
              2
            </div>
            <span className={`text-sm ${step === 'divinate' ? 'text-[#4B3A33] dark:text-yellow-100' : 'text-[#8A6658] dark:text-yellow-600'}`}>
              起卦
            </span>
            <ChevronRight className="w-4 h-4 text-[#B79A86] dark:text-yellow-700" />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${
              step === 'result' || step === 'detail'
                ? 'bg-[#C97C6D] text-white dark:bg-yellow-600 dark:text-neutral-900' 
                : 'bg-[#F8EEE5] text-[#B79A86] dark:bg-neutral-800 dark:text-neutral-600'
            }`}>
              3
            </div>
            <span className={`text-sm ${step === 'result' || step === 'detail' ? 'text-[#4B3A33] dark:text-yellow-100' : 'text-[#8A6658] dark:text-yellow-600'}`}>
              解卦
            </span>
          </div>
        </div>

        {/* 步骤 1: 选择问事场景 */}
        {step === 'select' && (
          <SceneSelector scenes={questionScenes} onSelectScene={handleSelectScene} />
        )}

        {/* 步骤 2: 数字起卦 */}
        {step === 'divinate' && selectedScene && (
          <DivinationForm
            selectedScene={selectedScene}
            questionContent={questionContent}
            num1={num1}
            num2={num2}
            num3={num3}
            isCalculating={isCalculating}
            onBackToScene={handleBackToScene}
            onQuestionContentChange={setQuestionContent}
            onNum1Change={setNum1}
            onNum2Change={setNum2}
            onNum3Change={setNum3}
            onGenerateRandom={generateRandomNumbers}
            onCalculate={handleCalculate}
          />
        )}

        {/* 步骤 3: 解卦结果 */}
        {(step === 'result' || step === 'detail') && result && selectedScene && (
          <div className="space-y-6">
            {/* 返回按钮 */}
            <button
              onClick={step === 'result' ? handleBackToDivinate : () => setStep('result')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg
                       text-[#6B5549] dark:text-amber-300 hover:text-[#4B3A33] dark:hover:text-[#F4E9DE]
                       hover:bg-[#F8EEE5] dark:hover:bg-[#6C5246]/50 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{step === 'detail' ? '返回解卦结果' : '重新起卦'}</span>
            </button>

            {step === 'result' ? (
              /* 解卦结果页面 */
              <>
                <div className="space-y-6">
                  {/* 问事场景标签 */}
                  <div className={`p-4 rounded-xl border-2 ${selectedScene.bgColor}`}>
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg bg-white/80 dark:bg-neutral-800/80 ${selectedScene.color} mr-3`}>
                        {selectedScene.icon}
                      </div>
                      <div>
                        <p className="text-sm text-[#8A6658] dark:text-yellow-500">问事场景</p>
                        <h3 className={`font-bold text-lg ${selectedScene.color}`}>{selectedScene.name}</h3>
                      </div>
                    </div>
                  </div>

                {/* 卦象概览 */}
                {result.gua && (
                  <GuaOverview gua={result.gua} dongYao={result.dongYao} />
                )}

                {/* AI 解卦 */}
                <AIInterpretationPanel
                  aiInterpretation={result.aiInterpretation}
                  aiAvailable={aiAvailable}
                  aiLoading={aiLoading}
                  aiError={aiError}
                  onRequestInterpretation={handleAIInterpretation}
                />

                {/* AI 对话区域 - 在 AI 解卦结果下方 */}
                {result.aiInterpretation && (
                  <ChatPanel
                    messages={chatMessages}
                    input={chatInput}
                    loading={chatLoading}
                    error={chatError}
                    contextSummary={chatContextSummary}
                    sceneName={selectedScene?.name}
                    onInputChange={setChatInput}
                    onSend={handleSendChatMessage}
                    onKeyDown={handleChatKeyDown}
                  />
                )}
                </div>

                <GuaAnalysisPanel
                  result={result}
                  selectedScene={selectedScene}
                  detailsExpanded={detailsExpanded}
                  onToggleDetails={() => setDetailsExpanded((prev) => !prev)}
                  onShowDetail={handleShowDetail}
                  onRestart={handleRestart}
                />
              </>
            ) : (
              <>
                {result.gua && (
                  <GuaDetailView
                    gua={result.gua}
                    dongYao={result.dongYao}
                    selectedScene={selectedScene}
                  />
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-[#6C5246] dark:bg-neutral-900 text-[#DCC7B6] dark:text-yellow-200/70 py-8 mt-12 
                       transition-colors duration-500 border-t dark:border-yellow-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2">易经问事解卦</p>
          <p className="text-sm text-[#B79A86]">传承中华传统文化，探索易经智慧</p>
        </div>
      </footer>
    </div>
  );
}

