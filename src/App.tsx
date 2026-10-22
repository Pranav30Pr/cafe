import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Terms } from './pages/Terms';
import { CookiePolicy } from './pages/CookiePolicy';
import { OrderPolicy } from './pages/OrderPolicy';
import { Accessibility } from './pages/Accessibility';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Kitchen } from './pages/Kitchen';
import { Admin } from './pages/Admin';
import { NotFound } from './pages/NotFound';

// Mobile Glassmorphic Table Ordering App (Phase 2 & Phase 4)
import { TableApp } from './app/TableApp';
import { MenuTab } from './app/tabs/MenuTab';
import { OrderTab } from './app/tabs/OrderTab';
import { StatusTab } from './app/tabs/StatusTab';
import { InfoTab } from './app/tabs/InfoTab';
import { LoyaltyClubTab } from './app/tabs/LoyaltyClubTab';
import { OrderStatusScreen } from './app/screens/OrderStatusScreen';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Mobile Glassmorphic QR Table Ordering App */}
        <Route path="/t/:token" element={<TableApp />}>
          <Route index element={<MenuTab />} />
          <Route path="order" element={<OrderTab />} />
          <Route path="status" element={<StatusTab />} />
          <Route path="status/:orderId" element={<OrderStatusScreen />} />
          <Route path="club" element={<LoyaltyClubTab />} />
          <Route path="info" element={<InfoTab />} />
        </Route>

        {/* Public Website & Admin Routes wrapped in standard Layout */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                {/* Public Website Routes (Phase 1) */}
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Legal Pages (Section 7) */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/order-policy" element={<OrderPolicy />} />
                <Route path="/accessibility" element={<Accessibility />} />

                {/* Order Confirmation */}
                <Route path="/order/:id" element={<OrderConfirmation />} />

                {/* Staff Screens */}
                <Route path="/kitchen" element={<Kitchen />} />
                <Route path="/admin" element={<Admin />} />

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
