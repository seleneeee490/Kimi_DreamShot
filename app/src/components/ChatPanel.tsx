import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { asset } from '../lib/path';

const quickReplies = [
  '今天干嘛了',
  '我好看吗',
  '想你了',
  '帮我选场景',
  '你在忙吗',
  '好紧张',
];

// 用户消息 → GD 回复池
const replyMap: Record<string, string[]> = {
  '今天干嘛了': [
    '在工作室待了一天。写了一小段，不太好，删掉了。你来了刚好，换换脑子。',
    '没干嘛，睡觉睡到中午。你呢，今天做了什么。',
    '试了几套衣服，都不满意。最后穿了最旧的这件。人果然还是舒服最重要。',
  ],
  '我好看吗': [
    '...干嘛突然问这个。',
    '（看了你几秒）嗯。今天...挺好看的。',
    '你不是一直都知道吗。还问。',
  ],
  '想你了': [
    '...嗯。我也是。刚才在咖啡店看到一对情侣，就想如果你在就好了。',
    '这么快就想了。我们才...好吧，我也想了。一点点。',
    '想我了那就过来。我在这儿呢。',
  ],
  '帮我选场景': [
    '海边吧。日落的时候光线最好，站在那种光里...应该会很好看。',
    '樱花树？这个季节应该开得正好。但人可能很多...算了。',
    '咖啡厅吧。人少，安静，不用想太多。',
  ],
  '你在忙吗': [
    '还好。在等你的时候把一首歌改完了。现在没事了。',
    '本来有点事，但你来了...那些可以等一下。',
    '忙完了。你不来我可能还在对着电脑发呆。',
  ],
  '好紧张': [
    '紧张什么，又不是真的去约会。只是在拍照而已。',
    '...我也紧张。很少会这样。但跟你在一起，有时候不知道说什么。',
    '放轻松。就当作在玩。拍不好就再拍，反正不赶时间。',
  ],
  '默认': [
    '嗯？',
    '你说什么，刚才在想别的。',
    '...有意思。继续说。',
    '真的假的。',
    '是吗。我还真没想过。',
    '嗯，我懂。',
    '你啊...总让我不知道怎么接。',
    '哈哈。',
    '...',
  ],
};

// 场景选择后的自然回复
const sceneReplies: Record<string, string[]> = {
  sakura: [
    '大头贴？可以。上次拍这个还是十年前。跟你一起的话...应该会不太一样。',
    '四宫格？好。我们多拍几张，选最好看的留下来。',
  ],
  beach: [
    '海边？可以。我喜欢日落时的海，那时候的颜色...很适合你。',
    '去海边吧。穿舒服一点的鞋，别穿凉鞋，沙子会磨脚。',
  ],
  cafe: [
    '演唱会后台？你真的想去那种地方？很乱的。不过...你想看的话我带你进去。',
    '后台没什么好看的，一堆设备和工作人员。但如果你想看看我平时工作的地方...行吧。',
  ],
  couple: [
    '情侣写真...好正式。我们拍的话，不需要那些花里胡哨的。',
    '可以啊。但我不习惯对着镜头笑...你教教我？',
  ],
  dream: [
    '梦幻的？有时候现实比梦更好。不过...你想去的话我陪你。',
    '星空？小时候很喜欢。跟你一起看的话，可能会重新喜欢起来。',
  ],
};

// 空闲时主动发的消息
const idleChats = [
  '你平时喜欢听什么歌。不是最近流行的，是你一个人走路时会听的。',
  '我觉得...今天的光线很适合拍照。你喜欢晴天还是阴天？',
  '刚才看到一只猫，黑色的。突然就想告诉你。',
  '你有没有那种...不管过多久都忘不掉的地方。',
  '我饿了。拍完去吃东西？我知道一家店，没什么人。',
  '这首歌你听过吗。我最近一直在循环。',
  '...刚才不小心睡着了。现在醒了。',
];

const openingLines = [
  '来了？等了你一会儿。今天想做什么。',
  '...来了啊。刚才在想事情，没注意到。',
  '坐吧。咖啡还热着，刚买的。',
  '嗯。你来了。那我们可以开始了。',
];

function getRandomReply(key: string): string {
  const replies = replyMap[key] || replyMap['默认'];
  return replies[Math.floor(Math.random() * replies.length)];
}

function getSceneReply(sceneId: string): string {
  const replies = sceneReplies[sceneId] || ['好。那就这个吧。'];
  return replies[Math.floor(Math.random() * replies.length)];
}

// 用于 StudioPage 调用的场景聊天
export function useSceneChat() {
  const { addChatMessage } = useApp();

  const sendSceneChat = useCallback((sceneId: string, sceneName: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    addChatMessage({ id: Date.now().toString(), sender: 'user', text: `去${sceneName}吧`, time });

    setTimeout(() => {
      addChatMessage({
        id: (Date.now() + 1).toString(),
        sender: 'gd',
        text: getSceneReply(sceneId),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      });
    }, 700 + Math.random() * 600);
  }, [addChatMessage]);

  return sendSceneChat;
}

export default function ChatPanel() {
  const { state, addChatMessage, toggleChat } = useApp();
  const [input, setInput] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // 开场白
  useEffect(() => {
    if (!hasOpened && state.chatOpen && state.chatMessages.length === 0) {
      const delay = setTimeout(() => {
        const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        const line = openingLines[Math.floor(Math.random() * openingLines.length)];
        addChatMessage({ id: 'open-1', sender: 'gd', text: line, time });
        setHasOpened(true);
      }, 400);
      return () => clearTimeout(delay);
    }
  }, [hasOpened, state.chatOpen, state.chatMessages.length, addChatMessage]);

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatMessages, showTyping]);

  // 空闲触发
  useEffect(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (state.chatOpen && state.chatMessages.length > 0 && !showTyping) {
      idleTimerRef.current = setTimeout(() => {
        if (Math.random() > 0.6) {
          const msg = idleChats[Math.floor(Math.random() * idleChats.length)];
          const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
          setShowTyping(true);
          setTimeout(() => {
            setShowTyping(false);
            addChatMessage({ id: Date.now().toString(), sender: 'gd', text: msg, time });
          }, 1000 + Math.random() * 1500);
        }
      }, 20000 + Math.random() * 15000);
    }
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [state.chatMessages.length, state.chatOpen, showTyping, addChatMessage]);

  const handleSend = (text: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    addChatMessage({ id: Date.now().toString(), sender: 'user', text, time });
    setInput('');

    setShowTyping(true);
    const delay = 600 + Math.random() * 1200;

    setTimeout(() => {
      setShowTyping(false);
      const reply = getRandomReply(text);
      addChatMessage({
        id: (Date.now() + 1).toString(),
        sender: 'gd',
        text: reply,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      });
    }, delay);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || showTyping) return;
    handleSend(input.trim());
  };

  return (
    <div className="fixed right-4 bottom-4 w-[360px] max-h-[520px] z-50 flex flex-col liquid-glass rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 shrink-0">
        <div className="relative">
          <img
            src={asset('gd-avatar.jpg')}
            alt="GD"
            className="w-9 h-9 rounded-full object-cover ring-1 ring-white/20"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[hsl(201,100%,13%)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">GD</div>
          <div className="text-[10px] text-muted-foreground tracking-wide">
            {showTyping ? '正在输入...' : '在线'}
          </div>
        </div>
        <button
          onClick={toggleChat}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {state.chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-white/15 text-foreground rounded-br-sm'
                  : 'bg-white/5 text-foreground/90 rounded-bl-sm'
              }`}
            >
              {msg.text}
              <div
                className={`text-[9px] text-muted-foreground mt-1 ${
                  msg.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {showTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2 border-t border-white/5 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              onClick={() => handleSend(reply)}
              className="px-3 py-1.5 rounded-full text-[11px] bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 pt-2 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-2 liquid-glass rounded-full px-3 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="跟他说点什么..."
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || showTyping}
            className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center transition-colors hover:bg-white/20 disabled:opacity-30"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
