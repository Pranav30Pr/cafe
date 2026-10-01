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
import { QrOrder } from './pages/QrOrder';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Kitchen } from './pages/Kitchen';
import { Admin } from './pages/Admin';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
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

          {/* QR Ordering & Confirmation (Phase 2) */}
          <Route path="/t/:token" element={<QrOrder />} />
          <Route path="/order/:id" element={<OrderConfirmation />} />

          {/* Kitchen Tablet Screen (Phase 2) */}
          <Route path="/kitchen" element={<Kitchen />} />

          {/* Owner Dashboard & Operations (Phase 3) */}
          <Route path="/admin" element={<Admin />} />

          {/* 404 Not Found Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};
