import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { ReviewPrompt } from './components/ReviewPrompt';
import { GateFlow } from './components/GateFlow';
import { BottomNav } from './components/BottomNav';

import { ChatPage } from './pages/ChatPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { ProfilePage } from './pages/ProfilePage';
import { OptionsPage } from './pages/options/OptionsPage';
import { FoodOrderPage } from './pages/options/FoodOrderPage';
import { DrinksOrderPage } from './pages/options/DrinksOrderPage';
import { WakeUpPage } from './pages/options/WakeUpPage';
import { CleaningPage } from './pages/options/CleaningPage';
import { ReviewDiscountPage } from './pages/options/ReviewDiscountPage';
import { ProblemPage } from './pages/options/ProblemPage';
import { WeatherPage } from './pages/options/WeatherPage';
import { ExtensionPage } from './pages/options/ExtensionPage';
import { HookahPage } from './pages/options/HookahPage';
import { NotificationsPage } from './pages/NotificationsPage';

// Chat is a full-screen conversation (Telegram-style) with its own back button, so the
// floating tab bar would only cover the composer there.
const FULL_SCREEN_PATHS = ['/chat'];

function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const fullScreen = FULL_SCREEN_PATHS.includes(pathname);
  return (
    <div className={`app-shell ${fullScreen ? 'app-shell--full' : ''}`}>
      {children}
      {!fullScreen && <BottomNav />}
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
    <NotificationsProvider>
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
              {/* Options hub is the landing page for now; Home/Map/Guide are "coming soon".
                  The original pages (HomePage, MapPage, GuidePage, PlacePage, …) are kept in
                  src/pages — swap the routes back when those sections launch. */}
              <Route path="/" element={<OptionsPage />} />
              <Route path="/home" element={<ComingSoonPage section="home" />} />
              <Route path="/place/:id" element={<ComingSoonPage section="home" />} />
              <Route path="/history" element={<ComingSoonPage section="home" />} />
              <Route path="/map" element={<ComingSoonPage section="map" />} />
              <Route path="/guide/*" element={<ComingSoonPage section="guide" />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/options" element={<Navigate to="/" replace />} />
              <Route path="/options/food" element={<FoodOrderPage />} />
              <Route path="/options/drinks" element={<DrinksOrderPage />} />
              <Route path="/options/hookah" element={<HookahPage />} />
              <Route path="/options/wake-up" element={<WakeUpPage />} />
              <Route path="/options/cleaning" element={<CleaningPage />} />
              <Route path="/options/review" element={<ReviewDiscountPage />} />
              <Route path="/options/problem" element={<ProblemPage />} />
              <Route path="/options/weather" element={<WeatherPage />} />
              <Route path="/options/extension" element={<ExtensionPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </AppShell>
      <ReviewPrompt />
    </NotificationsProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <GateFlow>
            <GatedApp />
          </GateFlow>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
