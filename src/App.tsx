import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import { GateFlow } from './components/GateFlow';
import { BottomNav } from './components/BottomNav';

import { HomePage } from './pages/HomePage';
import { PlacePage } from './pages/PlacePage';
import { MapPage } from './pages/MapPage';
import { GuidePage } from './pages/GuidePage';
import { BuildRoutePage } from './pages/BuildRoutePage';
import { RouteDetailPage } from './pages/RouteDetailPage';
import { RoutePlayerPage } from './pages/RoutePlayerPage';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { HistoryPage } from './pages/HistoryPage';
import { OptionsPage } from './pages/options/OptionsPage';
import { FoodOrderPage } from './pages/options/FoodOrderPage';
import { DrinksOrderPage } from './pages/options/DrinksOrderPage';
import { WakeUpPage } from './pages/options/WakeUpPage';
import { CleaningPage } from './pages/options/CleaningPage';
import { ReviewDiscountPage } from './pages/options/ReviewDiscountPage';
import { ProblemPage } from './pages/options/ProblemPage';
import { WeatherPage } from './pages/options/WeatherPage';
import { ExtensionPage } from './pages/options/ExtensionPage';
import { NotificationsPage } from './pages/NotificationsPage';

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      {children}
      <BottomNav />
    </div>
  );
}

// Route-change transition: fades + gently rises. `mode="wait"` for the tab-bar
// destinations (Home/Map/Guide/Chat) would feel sluggish, so instead we cross-fade —
// the entering page slides in on top while the previous one fades out beneath it.
const pageVariants: Variants = {
  initial: { opacity: 0, y: 14, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.99 },
};

function GatedApp() {
  const location = useLocation();
  return (
    <AppShell>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/place/:id" element={<PlacePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/guide/build" element={<BuildRoutePage />} />
            <Route path="/guide/route/:id" element={<RouteDetailPage />} />
            <Route path="/guide/route/:id/play" element={<RoutePlayerPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/options" element={<OptionsPage />} />
            <Route path="/options/food" element={<FoodOrderPage />} />
            <Route path="/options/drinks" element={<DrinksOrderPage />} />
            <Route path="/options/wake-up" element={<WakeUpPage />} />
            <Route path="/options/cleaning" element={<CleaningPage />} />
            <Route path="/options/review" element={<ReviewDiscountPage />} />
            <Route path="/options/problem" element={<ProblemPage />} />
            <Route path="/options/weather" element={<WeatherPage />} />
            <Route path="/options/extension" element={<ExtensionPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <GateFlow>
          <GatedApp />
        </GateFlow>
      </AuthProvider>
    </LangProvider>
  );
}
