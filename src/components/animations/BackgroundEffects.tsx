import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// 漂浮的粒子
function Particle({ delay = 0 }: { delay?: number }) {
  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;
  const size = Math.random() * 3 + 1;
  const duration = Math.random() * 20 + 15;
  
  return (
    <motion.div
      className="absolute rounded-full bg-cyan-400/30"
      style={{
        left: `${randomX}%`,
        top: `${randomY}%`,
        width: size,
        height: size,
      }}
      animate={{
        y: [0, -100, 0],
        x: [0, Math.random() * 50 - 25, 0],
        opacity: [0, 0.6, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

// 背景光晕
function GlowOrb({ 
  color = 'cyan', 
  size = 400, 
  x = '50%', 
  y = '50%',
  delay = 0 
}: { 
  color?: 'cyan' | 'purple' | 'blue';
  size?: number;
  x?: string;
  y?: string;
  delay?: number;
}) {
  const colors = {
    cyan: 'from-cyan-500/20 to-transparent',
    purple: 'from-purple-500/15 to-transparent',
    blue: 'from-blue-500/15 to-transparent',
  };
  
  return (
    <motion.div
      className={`absolute rounded-full bg-gradient-radial ${colors[color]} blur-3xl pointer-events-none`}
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// 网格线
function GridLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}

// 主背景组件
export default function BackgroundEffects() {
  const [particles, setParticles] = useState<number[]>([]);
  
  useEffect(() => {
    // 客户端生成粒子，避免 hydration 不匹配
    setParticles(Array.from({ length: 30 }, (_, i) => i));
  }, []);
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* 深色渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      
      {/* 网格线 */}
      <GridLines />
      
      {/* 光晕效果 */}
      <GlowOrb color="cyan" size={600} x="20%" y="30%" delay={0} />
      <GlowOrb color="purple" size={500} x="80%" y="20%" delay={2} />
      <GlowOrb color="blue" size={450} x="50%" y="80%" delay={4} />
      <GlowOrb color="cyan" size={350} x="10%" y="70%" delay={3} />
      
      {/* 漂浮粒子 */}
      {particles.map((i) => (
        <Particle key={i} delay={i * 0.5} />
      ))}
      
      {/* 底部渐变遮罩 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </div>
  );
}
