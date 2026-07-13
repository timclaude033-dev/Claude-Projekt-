import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { GridBackground } from './components/GridBackground';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Trading } from './pages/Trading';
import { Journal } from './pages/Journal';
import { Insight } from './pages/Insight';
import { Learn } from './pages/Learn';
import { LessonPage } from './pages/LessonPage';

export default function App() {
  const location = useLocation();
  return (
    <div className="relative min-h-screen">
      <GridBackground />
      <Sidebar />
      <main className="relative z-10 ml-60 px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Routes location={location}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/trading" element={<Trading />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/ki" element={<Insight />} />
              <Route path="/lernen" element={<Learn />} />
              <Route path="/lernen/:id" element={<LessonPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
