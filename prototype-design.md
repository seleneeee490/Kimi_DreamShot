每一个像素的退让，都是对人类直觉的尊重。
# DreamShot AI驱动电子手帐 — 原型设计文档

> **Version**: 1.0  
> **Date**: 2026-04-29  
> **Product**: DreamShot (드림샷)  
> **Scope**: Landing Page · Studio · Diary · Chat Panel  
> **Stack**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui

---

## 1. 信息架构 (Information Architecture)

### 1.1 站点地图

```
/
├── /                  Landing Page (入口)
├── /studio            Studio (核心摄影棚)
│   ├── Left Panel     上传区 + 场景选择
│   ├── Center         监视器取景框 + 快门
│   ├── Right Panel    摄影棚参数
│   └── Chat Overlay   GD 男友对话 (浮层)
└── /diary             Diary (手帐回顾)
```

### 1.2 用户流程

```
用户打开网站
    │
    ▼
Landing Page — 情感文案 + 视频背景
    │ "Would you like to spend a wonderful day with me today"
    ▼ (点击 Begin Journey)
Studio Page — 三栏布局
    │
    ├─ 步骤1: 上传照片 → GD 收到消息反馈
    ├─ 步骤2: 选择场景 → GD 场景评论
    ├─ 步骤3: 选择滤镜 (可选)
    ├─ 步骤4: 按下快门 → 2.5s AI合成动画
    └─ 步骤5: 写日记备注 → 保存到 Diary
    │
    ▼ (点击日记图标)
Diary Page — 瀑布流卡片
    │
    └─ 回顾所有 Entry / 返回 Studio
```

### 1.3 状态机 (App State Machine)

```
[Idle] ──上传照片──→ [PhotoUploaded]
  │                       │
  │                  选择场景
  │                       ▼
  │                  [SceneSelected]
  │                       │
  │                  按下快门
  │                       ▼
  │                  [Capturing] ──2.5s──→ [PhotoGenerated]
  │                                               │
  │                                          写日记/跳过
  │                                               ▼
  └──────────────────────────────────────── [EntrySaved] → [Idle]
```

---

## 2. 全局设计系统 (Global Design System)

### 2.1 色彩规范

#### CSS 变量定义

```css
:root {
  /* 核心背景 — 深邃海军蓝 */
  --background: 201 100% 13%;        /* hsl(201, 100%, 13%) = #001a2b */
  
  /* 主文字 — 纯白 */
  --foreground: 0 0% 100%;            /* #ffffff */
  
  /* 次要文字 — 灰紫调 */
  --muted-foreground: 240 4% 66%;     /* hsl(240, 4%, 66%) = #a4a4b0 */
  
  /* 强调色 */
  --primary: 0 0% 100%;
  --primary-foreground: 0 0% 4%;
  --secondary: 0 0% 10%;
  --accent: 0 0% 10%;
  
  /* 边框 */
  --border: 0 0% 18%;                 /* hsl(0, 0%, 18%) = #2e2e2e */
  --ring: 0 0% 100%;
}
```

#### 语义化颜色使用

| Token | 色值 | 用途 |
|-------|------|------|
| `bg-background` | `#001a2b` | 页面底色 |
| `text-foreground` | `#ffffff` | 主标题、重要文字 |
| `text-muted-foreground` | `#a4a4b0` | 副标题、说明文字、标签 |
| `border-border` | `#2e2e2e` | 分割线、面板边框 |
| `bg-white/10` | `rgba(255,255,255,0.1)` | hover 状态 |
| `bg-white/5` | `rgba(255,255,255,0.05)` | 次级卡片背景 |

#### 状态色

| 状态 | 色值 | 用途 |
|------|------|------|
| Online | `#34d399` (emerald-400) | 在线状态指示 |
| Recording | `#ef4444` (red-500) | REC 录制灯 |
| Active | `#a78bfa` (purple-400) | Chat 未读 |
| Loading | `#60a5fa` (blue-400) | 进度条 |

### 2.2 字体系统

```css
/* Display — 大标题、Logo */
--font-display: 'Instrument Serif', serif;

/* Body — 正文、UI文字 */
--font-body: 'Inter', sans-serif;
```

| 层级 | 字体 | 大小 | 字重 | 行高 | 字距 | 用途 |
|------|------|------|------|------|------|------|
| H1 | Instrument Serif | 48-72px | 400 | 0.95 | -2.46px | Landing 主标题 |
| H2 | Instrument Serif | 24-36px | 400 | 1.1 | -1px | 页面标题 |
| Body | Inter | 14-16px | 400 | 1.5 | 0 | 正文、描述 |
| Caption | Inter | 10-12px | 400 | 1.4 | 0.05em | 标签、时间戳 |
| Nav | Inter | 12-14px | 500 | 1 | 0 | 导航链接 |
| Button | Inter | 14-16px | 500 | 1 | 0 | 按钮文字 |

### 2.3 间距系统

| Token | 值 | 用途 |
|-------|-----|------|
| `px-6` | 24px | 页面左右内边距 |
| `py-4` | 16px | Header 上下内边距 |
| `p-4` | 16px | 卡片内边距 |
| `p-3` | 12px | 紧凑卡片内边距 |
| `gap-3` | 12px | 组件间距 |
| `gap-2` | 8px | 紧凑间距 |
| `space-y-5` | 20px | 面板区块间距 |
| `max-w-7xl` | 1280px | 内容最大宽度 |

### 2.4 Liquid Glass 材质规范

Liquid Glass 是本产品的核心视觉标识，定义如下:

```css
.liquid-glass {
  /* 极低不透明度背景 */
  background: rgba(255, 255, 255, 0.01);
  background-blend-mode: luminosity;
  
  /* 毛玻璃模糊 */
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  
  /* 内部高光 */
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  
  /* 折射边框 — 通过伪元素实现 */
  position: relative;
  overflow: hidden;
}

.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.45) 0%,
    rgba(255,255,255,0.15) 20%,
    rgba(255,255,255,0) 40%,
    rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.15) 80%,
    rgba(255,255,255,0.45) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

**使用场景**:
- 所有按钮 (快门按钮、CTA、导航按钮)
- 卡片 (场景卡片、滤镜标签、设置面板)
- 输入框 (聊天输入、日记备注)
- 监视器外框

---

## 3. 页面原型 (Page Prototypes)

### 3.1 Landing Page (首页)

#### 布局
```
┌─────────────────────────────────────────┐
│  [视频背景 - 全屏循环]                   │
│  [Liquid Glass 暗色遮罩 overlay]         │
│                                          │
│  [🌙 Logo]  DreamShot®    Home  Studio   │
│                           Diary  About   │
│                                          │
│                                          │
│     "Would you like to spend a           │
│      wonderful day with me today"        │
│                                          │
│      오랫동안 뵙지 못했는데 당신이      │
│      무척 보고 싶어요 / I miss you～    │
│                                          │
│         [ Begin Journey ]                │
│                                          │
│      PEACEMINUSONE · A LOVE DIARY 💛    │
│                                          │
└─────────────────────────────────────────┘
```

#### 组件规格

**Navigation Bar**
| 属性 | 值 |
|------|-----|
| Position | `relative z-10` |
| Layout | `flex row justify-between` |
| Padding | `px-8 py-6` |
| Max Width | `max-w-7xl mx-auto` |
| Logo | "DreamShot®" — Instrument Serif, text-3xl, tracking-tight |
| Nav Links | 桌面端 `md:flex`, 移动端隐藏 |
| CTA | "Begin Journey" — liquid-glass, rounded-full, px-6 py-2.5 |

**Hero Section**
| 属性 | 值 |
|------|-----|
| Position | `relative z-10`, flex column, centered |
| Padding | `px-6 pt-32 pb-40` |
| H1 | text-5xl sm:7xl md:8xl, leading-0.95, tracking-[-2.46px] |
| H1 强调 | "wonderful day" — `em.not-italic text-muted-foreground` |
| Subtext | text-muted-foreground, text-base sm:text-lg, max-w-2xl, mt-8 |
| CTA | liquid-glass, rounded-full, px-14 py-5, mt-12 |
| Footer line | text-[10px], text-muted-foreground/60 |

**入场动画**
```css
H1:     animate-fade-rise       (0s delay)
Subtext: animate-fade-rise-delay  (0.2s delay)
CTA:     animate-fade-rise-delay-2 (0.4s delay)

@keyframes fade-rise {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

### 3.2 Studio Page (摄影棚)

#### 整体布局
```
┌─────────────────────────────────────────────────────────────┐
│ [←] [🌙] DreamShot          [남편이 기다리고 있어요] [📖] [💬] │
│                    PEACEMINUSONE · A LOVE DIARY             │
├──────────────────┬─────────────────────┬────────────────────┤
│                  │                     │                    │
│  上传照片        │                     │   摄影棚参数        │
│  [你] [GD 옴파]  │   监视器取景框       │   [相机][光影][角度][调色]│
│                  │   ┌───────────┐     │                    │
│  拍摄场景        │   │ ■ 取景框  │     │   胶片模拟          │
│  📸 人生四宫格   │   │    📷     │     │   ○ 无 ●富士CC ...  │
│  🌅 海边日落     │   │           │     │                    │
│  🎤 演唱会后台   │   └───────────┘     │   当前设置          │
│  💑 情侣写真     │                     │   对象: GD 옴파     │
│  🔮 梦幻联动     │                     │   场景: 未选择      │
│                  │                     │   滤镜: 富士CC      │
│  场景参考图      │                     │                    │
│  [上传区域]      │                     │                    │
│                  │                     │                    │
├──────────────────┴─────────────────────┴────────────────────┤
│        [ ✨ 按下快门 — 开始拍摄 ]                            │
│        ● 所有处理在本地完成，照片不会上传                     │
└─────────────────────────────────────────────────────────────┘
                    [💬 Chat 浮层]
```

#### Header

| 属性 | 值 |
|------|-----|
| Height | 72px |
| Border | `border-b border-border/50` |
| Left | Back btn + Logo + Brand line |
| Right | Status badge + Diary btn + Chat btn |

**Status Badge**
- Style: `liquid-glass rounded-full px-4 py-1.5`
- Content: green pulse dot + "남편이 기다리고 있어요"
- Animation: pulse dot (1.5s infinite)

#### Left Panel — 拍摄控制

**宽度**: `w-[280px]` (桌面端), 移动端通过 tab 切换

**区块1: 上传照片**
- 两个方形卡片并排: "你" + "GD 옴파"
- 点击"你"触发 `<input type="file">`
- 上传后显示缩略图
- Style: `liquid-glass rounded-xl aspect-square`

**区块2: 拍摄场景**
- 4个快捷标签按钮 (横向滚动)
- 5个场景卡片纵向排列
- 每个场景: icon + 名称 + 3个tag
- 选中状态: `ring-1 ring-white/30 bg-white/10`
- Style: `liquid-glass rounded-xl p-3`

**区块3: 场景参考图**
- 上传区域 (虚线边框)
- Style: `liquid-glass rounded-xl border-dashed`

#### Center — 监视器

**尺寸**: flex-1 自适应, min-h-[300px]

**Frame Design**
```
┌──────────────────────────────────┐
│ ◉ REC         │         │        │
│               │         │        │
│  ┌──────┐    │         │        │
│  │      │    ├─────────┤        │
│  │  📷  │    │         │        │
│  │      │    ├─────────┤        │
│  └──────┘    │         │        │
│               │         │        │
└──────────────────────────────────┘
```

**视觉元素 (pointer-events: none)**
| 元素 | 规格 |
|------|------|
| 四角角标 | `w-6 h-6`, border-l-2 border-t-2, `border-white/20` |
| 中心十字 | `w-8 h-[1px]` + `w-[1px] h-8`, `bg-white/30` |
| REC 灯 | `w-2 h-2 rounded-full bg-red-500`, pulse animation |
| 网格线 | 3x3 grid, opacity 10% |

**状态切换**

| 状态 | 显示内容 | 背景 |
|------|----------|------|
| Idle | 相机图标 + "上传照片 + 选择场景" | liquid-glass |
| Capturing | Loader + "AI 合成中... 3, 2, 1" + 进度条 | bg-background/40 overlay |
| Generated | 合成照片全屏 | z-0 图片层 |
| Diary Input | 文字输入框 + "记入日记/跳过" | liquid-glass overlay |

**进度条动画**
```css
width: 100%;
animation: width 2.5s ease-out forwards;
```

#### Right Panel — 摄影棚参数

**宽度**: `w-[260px]` (桌面端 xl 断点显示)

**Tab 切换**: 相机 / 光影 / 角度 / 调色
- 4个等宽按钮, icon + label
- Active: `bg-white/10 text-foreground`
- Inactive: `text-muted-foreground`

**胶片模拟标签**
- 9个 pill-shaped 按钮
- Active: `bg-white/15 ring-1 ring-white/20`
- Inactive: `bg-white/5 text-muted-foreground`
- Layout: `flex-wrap gap-1.5`

**当前设置面板**
- 3行 key-value: 对象 / 场景 / 滤镜
- Style: `liquid-glass rounded-xl p-3`

#### Bottom — 快门区

```
┌─────────────────────────────────────┐
│  [ ✨ 按下快门 — 开始拍摄 ]          │
│  ● 所有处理在本地完成               │
└─────────────────────────────────────┘
```

**快门按钮**
- Style: `liquid-glass rounded-full py-4 w-full`
- Hover: `hover:scale-[1.02]`
- Active: `active:scale-[0.98]`
- Loading: disabled + spinner

#### Chat Overlay (浮层)

**触发**: 点击右下角 💬 图标

**位置**: `fixed right-4 bottom-4`
**尺寸**: `w-[360px] max-h-[520px]`

```
┌─────────────────────────────┐
│ [🖼] GD           online  [×]│
│     23:06                   │
├─────────────────────────────┤
│                             │
│  ...嗯。我也是。刚才看到    │
│  一对情侣，想如果你在就好   │
│                        23:07│
│                             │
│  想我了？          [发送]   │
├─────────────────────────────┤
│ [今天干嘛了] [想你了] [帮我选]│
├─────────────────────────────┤
│ [输入消息...]          [➤]  │
└─────────────────────────────┘
```

**Header**
- Avatar: `w-9 h-9 rounded-full ring-1 ring-white/20`
- Name: "GD"
- Status: "在线" / "正在输入..."
- Close: `X` button

**Message Bubble**
- GD: `bg-white/5 rounded-2xl rounded-bl-sm` (左侧)
- User: `bg-white/15 rounded-2xl rounded-br-sm` (右侧)
- Time: `text-[9px] text-muted-foreground`

**快捷回复**
- 4个 pill buttons 横向滚动
- Content: "今天干嘛了" / "我好看吗" / "想你了" / "帮我选场景"

**输入框**
- Style: `liquid-glass rounded-full`
- Placeholder: "跟他说点什么..."
- Send: `w-7 h-7 rounded-full bg-white/15`

---

### 3.3 Diary Page (手帐页)

#### 布局
```
┌─────────────────────────────────────────┐
│ [←] Our Diary          [남편이 기다리고 있어요]│
│       5 篇专属回忆                      │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ [Photo]  │  │ [Photo]  │  │ [Photo]││
│  │ 富士CC   │  │ 柯达P    │  │ ...    ││
│  │ 2026.04  │  │ 2026.04  │  │        ││
│  │          │  │          │  │        ││
│  │ "他说... │  │ "夕阳... │  │        ││
│  └──────────┘  └──────────┘  └────────┘│
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ [Photo]  │  │ [Photo]  │            │
│  │          │  │          │            │
│  └──────────┘  └──────────┘            │
│                                         │
├─────────────────────────────────────────┤
│    PEACEMINUSONE · A LOVE DIARY 💛     │
└─────────────────────────────────────────┘
```

**卡片规格**
- Layout: `grid grid-cols-1 md:2 lg:3 gap-6`
- Card: `liquid-glass rounded-2xl overflow-hidden`
- Photo area: `aspect-[3/4]` + gradient overlay
- Top badge: filter tag
- Bottom: date + scene + note text
- Hover: `hover:scale-[1.02]`

**Empty State**
- 大图标 + "还没有回忆" + "去摄影棚拍一张吧"
- CTA: "去拍摄" button

---

## 4. 动画规范 (Animation Spec)

### 4.1 入场动画

| 元素 | 动画 | 时长 | 延迟 | 缓动 |
|------|------|------|------|------|
| Landing H1 | fade-rise | 0.8s | 0s | ease-out |
| Landing Sub | fade-rise | 0.8s | 0.2s | ease-out |
| Landing CTA | fade-rise | 0.8s | 0.4s | ease-out |
| Studio Panels | slide-in-up | 0.6s | 0s | ease-out |

### 4.2 持续动画

| 元素 | 动画 | 周期 | 效果 |
|------|------|------|------|
| REC 红点 | rec-pulse | 2s | scale + shadow 扩散消失 |
| 监视器边框 | monitor-breathe | 5s | 内部蓝色柔光明暗呼吸 |
| 环境光球 | orb-drift | 18s | 缓慢漂移 + scale 变化 |
| 闪光粒子 | sparkle | 4s | 闪烁 + 旋转 |
| 快门按钮 | shutter-glow | 3s | 蓝色光晕呼吸 |
| 选中场景 | ring-pulse | 2.5s | 白色光晕扩散收缩 |
| AI合成扫描线 | scan-line | 3s | 水平线从上至下扫描 |

### 4.3 交互反馈

| 交互 | 反馈 | 时长 |
|------|------|------|
| Button hover | scale-[1.02] | 200ms |
| Button active | scale-[0.98] | 100ms |
| Scene select | ring + bg change | 150ms |
| Filter select | ring + bg change | 150ms |
| Chat open | fade-in | 200ms |
| Photo generate | progress bar width 0→100% | 2.5s |
| Tab switch | color transition | 150ms |

---

## 5. 响应式规范 (Responsive Design)

### 5.1 断点

| 断点 | 宽度 | 布局变化 |
|------|------|----------|
| `sm` | 640px | 基础调整 |
| `md` | 768px | 导航链接显示 |
| `lg` | 1024px | 左侧面板显示 |
| `xl` | 1280px | 右侧面板显示 |

### 5.2 移动端 (< lg)

- 三栏 → 单栏 + Tab 切换
- Tab: 拍摄 / 预览 / 参数
- Chat 浮层全屏
- 监视器保持完整

### 5.3 平板 (lg - xl)

- 左侧面板 + 中心监视器
- 右侧面板隐藏，参数集成到左侧面板底部

---

## 6. 数据模型 (Data Model)

### 6.1 TypeScript 接口

```typescript
// 聊天消息
interface ChatMessage {
  id: string;           // UUID
  sender: 'gd' | 'user';
  text: string;
  time: string;         // "HH:mm" format
}

// 手帐条目
interface DiaryEntry {
  id: string;
  photo: string;        // blob URL or path
  scene: string;        // scene name
  filter: string;       // filter name
  note: string;         // user's diary note
  date: string;         // "YYYY.MM.DD"
}

// 全局应用状态
interface AppState {
  selectedIdol: string;     // current idol ID
  selectedScene: string | null;
  selectedFilter: string;
  userPhoto: string | null; // uploaded photo URL
  generatedPhoto: string | null;
  diaryEntries: DiaryEntry[];
  chatMessages: ChatMessage[];
  chatOpen: boolean;
  isCapturing: boolean;
  diaryNote: string;
}
```

### 6.2 响应池数据结构

```typescript
// GD 响应映射
type ResponseKey = 
  | '今天干嘛了' | '我好看吗' | '想你了' 
  | '帮我选场景' | '你在忙吗' | '好紧张';

const replyMap: Record<ResponseKey | '默认', string[]> = {
  '今天干嘛了': [
    '在工作室待了一天。写了一小段，不太好，删掉了。',
    '没干嘛，睡觉睡到中午。你呢？',
  ],
  // ...
  '默认': ['嗯？', '你说什么，刚才在想别的。', '...'],
};

// 场景响应
const sceneReplies: Record<string, string[]> = {
  sakura: ['大头贴？可以。上次拍这个还是十年前。'],
  beach: ['海边？可以。我喜欢日落时的海。'],
  // ...
};
```

### 6.3 本地存储

```typescript
// 使用 localStorage 持久化
const STORAGE_KEY = 'dreamshot_diary';

// 保存
localStorage.setItem(STORAGE_KEY, JSON.stringify(diaryEntries));

// 读取
const entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
```

---

## 7. 交互状态矩阵 (Interaction Matrix)

### 7.1 Studio 页面状态

| 用户操作 | 状态变化 | UI 反馈 | Chat 反馈 |
|----------|----------|---------|-----------|
| 打开页面 | → Idle | 显示默认监视器 | GD 开场白 |
| 上传照片 | → PhotoUploaded | 显示缩略图 | "看到了。拍得不错。" |
| 选择场景 | → SceneSelected | 场景高亮 | 场景相关回复 |
| 按快门 | → Capturing | Loader + 进度条 | "3... 2... 1..." |
| 合成完成 | → PhotoGenerated | 显示照片 | "拍完了。你看一下。" |
| 写备注 | → EntrySaved | 保存到 Diary | "记下来了。" |
| 跳过备注 | → Idle | 返回默认 | — |

### 7.2 Chat 对话流程

```
用户发送消息
  → 匹配意图 (keyword matching)
  → 随机抽取响应 (from response pool)
  → 显示 "正在输入..." (600-1500ms)
  → 显示 GD 回复
  → 重置空闲计时器 (20-35s)
```

---

## 8. 组件清单 (Component Inventory)

### 8.1 页面级组件

| 组件 | 文件路径 | 描述 |
|------|----------|------|
| LandingPage | `src/pages/LandingPage.tsx` | 首页，视频背景 |
| StudioPage | `src/pages/StudioPage.tsx` | 核心摄影棚，三栏布局 |
| DiaryPage | `src/pages/DiaryPage.tsx` | 手帐回顾，瀑布流 |

### 8.2 可复用组件

| 组件 | 文件路径 | 描述 |
|------|----------|------|
| ChatPanel | `src/components/ChatPanel.tsx` | 浮层聊天面板 |
| — | — | 消息气泡、输入框、快捷回复 |

### 8.3 自定义 Hooks

| Hook | 文件路径 | 描述 |
|------|----------|------|
| useApp | `src/context/AppContext.tsx` | 全局状态管理 |
| useSceneChat | `src/components/ChatPanel.tsx` | 场景选择聊天触发 |

---

## 9. 素材清单 (Asset Inventory)

### 9.1 图片资源

| 文件名 | 尺寸 | 用途 | 来源 |
|--------|------|------|------|
| `logo.png` | 40x40 | 左上角 Logo | 用户上传 + 颜色调整 |
| `gd-avatar.jpg` | 40x40 | Chat 头像 | 用户上传 |
| `daisy-wallpaper.png` | 全屏 | Studio 背景 | 用户上传 |
| `demo-photo-1.jpg` | 3:4 | Demo 手帐图1 | AI 生成 |
| `demo-photo-2.jpg` | 3:4 | Demo 手帐图2 | AI 生成 |
| `demo-photo-3.jpg` | 3:4 | Demo 手帐图3 | AI 生成 |
| `demo-photo-4.jpg` | 3:4 | Demo 手帐图4 | AI 生成 |

### 9.2 视频资源

| 文件名 | 用途 | 来源 |
|--------|------|------|
| `background-video.mov` | Landing 页背景 | 用户上传 |

---

## 10. 性能规范 (Performance Spec)

### 10.1 加载性能

| 指标 | 目标 |
|------|------|
| First Contentful Paint (FCP) | < 1.5s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Time to Interactive (TTI) | < 3s |
| Bundle Size | < 200KB (gzipped) |

### 10.2 运行时性能

| 指标 | 目标 |
|------|------|
| 合成动画帧率 | 60fps |
| Chat 响应延迟 | < 200ms |
| 页面切换 | 无刷新，instant |
| 内存占用 | < 100MB |

### 10.3 优化策略

- **图片**: WebP 格式 + lazy loading
- **视频**: `preload="none"` + 压缩
- **字体**: `font-display: swap` + 子集化
- **CSS**: Tailwind purging + 关键 CSS inline
- **JS**: Code splitting + tree shaking

---

*Document crafted by DreamShot Design Team | 2026*
