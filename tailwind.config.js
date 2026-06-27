/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // 楷书 display（卦名/标题/卦辞），自托管，font-display:swap
        serif: ['"LXGW WenKai"', '"LXGW WenKai Screen"', 'Songti SC', 'STSong', 'SimSun', 'serif'],
        // 正文用系统无衬线栈，零下载
        sans: ['"PingFang SC"', '"Microsoft YaHei"', '"Hiragino Sans GB"', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // 全局统一为「问事解卦」双轨配色：
        // 浅色模式 = 陶土棕系（问事解卦浅色），深色模式 = yellow 金系（问事解卦深色）
        // 变量值在 src/index.css 的 :root / .dark 中定义，<alpha-value> 支持 /30 /50 等透明度修饰
        amber: {
          50: "rgb(var(--amber-50) / <alpha-value>)",
          100: "rgb(var(--amber-100) / <alpha-value>)",
          200: "rgb(var(--amber-200) / <alpha-value>)",
          300: "rgb(var(--amber-300) / <alpha-value>)",
          400: "rgb(var(--amber-400) / <alpha-value>)",
          500: "rgb(var(--amber-500) / <alpha-value>)",
          600: "rgb(var(--amber-600) / <alpha-value>)",
          700: "rgb(var(--amber-700) / <alpha-value>)",
          800: "rgb(var(--amber-800) / <alpha-value>)",
          900: "rgb(var(--amber-900) / <alpha-value>)",
          950: "rgb(var(--amber-950) / <alpha-value>)",
        },
        orange: {
          50: "rgb(var(--orange-50) / <alpha-value>)",
          100: "rgb(var(--orange-100) / <alpha-value>)",
          200: "rgb(var(--orange-200) / <alpha-value>)",
          300: "rgb(var(--orange-300) / <alpha-value>)",
          400: "rgb(var(--orange-400) / <alpha-value>)",
          500: "rgb(var(--orange-500) / <alpha-value>)",
          600: "rgb(var(--orange-600) / <alpha-value>)",
          700: "rgb(var(--orange-700) / <alpha-value>)",
          800: "rgb(var(--orange-800) / <alpha-value>)",
          900: "rgb(var(--orange-900) / <alpha-value>)",
          950: "rgb(var(--orange-950) / <alpha-value>)",
        },
        rose: {
          50: "rgb(var(--rose-50) / <alpha-value>)",
          100: "rgb(var(--rose-100) / <alpha-value>)",
          200: "rgb(var(--rose-200) / <alpha-value>)",
          300: "rgb(var(--rose-300) / <alpha-value>)",
          400: "rgb(var(--rose-400) / <alpha-value>)",
          500: "rgb(var(--rose-500) / <alpha-value>)",
          600: "rgb(var(--rose-600) / <alpha-value>)",
          700: "rgb(var(--rose-700) / <alpha-value>)",
          800: "rgb(var(--rose-800) / <alpha-value>)",
          900: "rgb(var(--rose-900) / <alpha-value>)",
          950: "rgb(var(--rose-950) / <alpha-value>)",
        },
        // 五行功能色（金木水火土），仅五行出现处使用；alpha 修饰支持 /15 /40 等浅底
        wx: {
          jin: "rgb(var(--wx-jin) / <alpha-value>)",
          mu: "rgb(var(--wx-mu) / <alpha-value>)",
          shui: "rgb(var(--wx-shui) / <alpha-value>)",
          huo: "rgb(var(--wx-huo) / <alpha-value>)",
          tu: "rgb(var(--wx-tu) / <alpha-value>)",
        },
      },
      borderRadius: {
        "3xl": "1.75rem",
        "2xl": "1.25rem",
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        // 命名阴影：柔浮、品牌色微染，颜色由 --shadow-color 变量驱动（浅棕/深金）
        card: "0 24px 50px -38px rgb(var(--shadow-color) / 0.42)",
        float: "0 34px 68px -44px rgb(var(--shadow-color) / 0.45)",
        pop: "0 18px 40px -20px rgb(var(--shadow-color) / 0.4)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}