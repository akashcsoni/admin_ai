import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import AboutPage from './pages/AboutPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import AccountBillingPage from './pages/AccountBillingPage'
import AccountInvoicePage from './pages/AccountInvoicePage'
import AccountPage from './pages/AccountPage'
import AccountUsagePage from './pages/AccountUsagePage'
import AccountSettingsPage from './pages/AccountSettingsPage'
import AccountSupportPage from './pages/AccountSupportPage'
import AccountSupportTicketPage from './pages/AccountSupportTicketPage'
import AccountServicePage from './pages/AccountServicePage'
import ContactPage from './pages/ContactPage'
import FAQPage from './pages/FAQPage'
import HomePage from './pages/HomePage'
import PricingPage from './pages/PricingPage'
import ServicesPage from './pages/ServicesPage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import StaticContentPage from './pages/StaticContentPage'
import StatusPage from './pages/StatusPage'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="careers" element={<StaticContentPage pageKey="careers" />} />
          <Route path="partnerships" element={<StaticContentPage pageKey="partnerships" />} />
          <Route path="guides" element={<StaticContentPage pageKey="guides" />} />
          <Route path="status" element={<StatusPage />} />
          <Route path="privacy" element={<StaticContentPage pageKey="privacy" />} />
          <Route path="terms" element={<StaticContentPage pageKey="terms" />} />
          <Route path="cookies" element={<StaticContentPage pageKey="cookies" />} />
          <Route path="security" element={<StaticContentPage pageKey="security" />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />

          <Route element={<GuestRoute />}>
            <Route path="signin" element={<SignInPage />} />
            <Route path="signup" element={<SignUpPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="account" element={<AccountPage />} />
            <Route path="account/billing" element={<AccountBillingPage />} />
            <Route path="account/billing/invoice/:purchaseId" element={<AccountInvoicePage />} />
            <Route path="account/usage" element={<AccountUsagePage />} />
            <Route path="account/settings" element={<AccountSettingsPage />} />
            <Route path="account/support" element={<AccountSupportPage />} />
            <Route path="account/support/:ticketId" element={<AccountSupportTicketPage />} />
            <Route path="account/services/:serviceId" element={<AccountServicePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
