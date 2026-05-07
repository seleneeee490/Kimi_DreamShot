import { Routes, Route } from 'react-router';
import { AppProvider } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import StudioPage from './pages/StudioPage';
import DiaryPage from './pages/DiaryPage';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/diary" element={<DiaryPage />} />
      </Routes>
    </AppProvider>
  );
}
