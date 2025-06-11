import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Restaurant from "./pages/Restaurant";
import Cart from "./pages/Cart";
import Address from "./pages/Address";
import Payment from "./pages/Payment";
import OrderTracking from "./pages/OrderTracking";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PersonalInfo from "./pages/PersonalInfo";
import Rewards from "./pages/Rewards";
import OrderHistory from "./pages/OrderHistory";
import PaymentMethods from "./pages/PaymentMethods";
import Preferences from "./pages/Preferences";
import Security from "./pages/Security";
import FAQs from "./pages/FAQs";
import Feedback from "./pages/Feedback";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <OrderProvider>
          <AuthProvider>
          <Toaster />
          <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<Search />} />
              <Route path="/restaurant/:id" element={<Restaurant />} />
                <Route element={<PrivateRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/personal-info" element={<PersonalInfo />} />
                  <Route path="/rewards" element={<Rewards />} />
                  <Route path="/order-history" element={<OrderHistory />} />
                  <Route path="/payment-methods" element={<PaymentMethods />} />
                  <Route path="/preferences" element={<Preferences />} />
                  <Route path="/security" element={<Security />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/address" element={<Address />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
                  <Route path="/order-tracking" element={<OrderTracking />} />
                </Route>
                <Route path="/faqs" element={<FAQs />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/terms-of-use" element={<TermsOfUse />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </AuthProvider>
        </OrderProvider>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
