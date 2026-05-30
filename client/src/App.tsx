import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthGate } from './components/AuthGate';
import { BottomNav } from './components/BottomNav';
import { ChatPage } from './pages/ChatPage';
import { DrawPage } from './pages/DrawPage';
import { FeaturedPage } from './pages/FeaturedPage';
import { LibraryPage } from './pages/LibraryPage';

function Layout() {
  return (
    <div className="min-h-screen bg-paper pb-16">
      <main className="mx-auto max-w-2xl">
        <Routes>
          <Route path="/" element={<DrawPage />} />
          <Route path="/featured" element={<FeaturedPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <Layout />
      </AuthGate>
    </BrowserRouter>
  );
}
