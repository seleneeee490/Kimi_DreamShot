import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

const STORAGE_KEY = 'dreamshot_data';

function loadFromStorage(): { diaryEntries: DiaryEntry[]; chatMessages: ChatMessage[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveToStorage(data: { diaryEntries: DiaryEntry[]; chatMessages: ChatMessage[] }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export interface ChatMessage {
  id: string;
  sender: 'gd' | 'user';
  text: string;
  time: string;
}

export interface DiaryEntry {
  id: string;
  photo: string;
  scene: string;
  filter: string;
  note: string;
  date: string;
}

export interface AppState {
  selectedIdol: string;
  selectedScene: string | null;
  selectedFilter: string;
  userPhoto: string | null;
  generatedPhoto: string | null;
  diaryEntries: DiaryEntry[];
  chatMessages: ChatMessage[];
  chatOpen: boolean;
  isCapturing: boolean;
  diaryNote: string;
}

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  addChatMessage: (msg: ChatMessage) => void;
  addDiaryEntry: (entry: DiaryEntry) => void;
  selectScene: (scene: string) => void;
  selectFilter: (filter: string) => void;
  setDiaryNote: (note: string) => void;
  toggleChat: () => void;
}

const demoEntries: DiaryEntry[] = [
  {
    id: 'demo-1',
    photo: '/demo-photo-1.jpg',
    scene: '人生四宫格大头贴',
    filter: '富士 Classic Chrome',
    note: '他说樱花飘落的速度是每秒五厘米，那我们的心跳呢？',
    date: '2026.04.28',
  },
  {
    id: 'demo-2',
    photo: '/demo-photo-2.jpg',
    scene: '海边日落散步',
    filter: '柯达 Portra',
    note: '夕阳把影子拉得很长，长到好像能走一辈子。',
    date: '2026.04.20',
  },
];

// 空初始状态，开场白由 ChatPanel 动态生成
const defaultState: AppState = {
  selectedIdol: 'gd',
  selectedScene: null,
  selectedFilter: '富士 Classic Chrome',
  userPhoto: null,
  generatedPhoto: null,
  diaryEntries: demoEntries,
  chatMessages: [],
  chatOpen: true,
  isCapturing: false,
  diaryNote: '',
};

// 从 localStorage 恢复数据，无则用默认值
function initState(): AppState {
  const saved = loadFromStorage();
  return {
    ...defaultState,
    diaryEntries: saved?.diaryEntries ?? demoEntries,
    chatMessages: saved?.chatMessages ?? [],
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initState);

  const addChatMessage = useCallback((msg: ChatMessage) => {
    setState((prev) => {
      const chatMessages = [...prev.chatMessages, msg];
      saveToStorage({ diaryEntries: prev.diaryEntries, chatMessages });
      return { ...prev, chatMessages };
    });
  }, []);

  const addDiaryEntry = useCallback((entry: DiaryEntry) => {
    setState((prev) => {
      const diaryEntries = [entry, ...prev.diaryEntries];
      saveToStorage({ diaryEntries, chatMessages: prev.chatMessages });
      return { ...prev, diaryEntries, generatedPhoto: null, diaryNote: '' };
    });
  }, []);

  const selectScene = useCallback((scene: string) => {
    setState((prev) => ({ ...prev, selectedScene: scene }));
  }, []);

  const selectFilter = useCallback((filter: string) => {
    setState((prev) => ({ ...prev, selectedFilter: filter }));
  }, []);

  const setDiaryNote = useCallback((note: string) => {
    setState((prev) => ({ ...prev, diaryNote: note }));
  }, []);

  const toggleChat = useCallback(() => {
    setState((prev) => ({ ...prev, chatOpen: !prev.chatOpen }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        setState,
        addChatMessage,
        addDiaryEntry,
        selectScene,
        selectFilter,
        setDiaryNote,
        toggleChat,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
