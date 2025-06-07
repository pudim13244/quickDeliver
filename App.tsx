import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Páginas
import Index from './src/pages/Index'
import Search from './src/pages/Search'
import Restaurant from './src/pages/Restaurant'
import Cart from './src/pages/Cart'
import Address from './src/pages/Address'
import Payment from './src/pages/Payment'
import OrderTracking from './src/pages/OrderTracking'
import NotFound from './src/pages/NotFound'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/restaurant/:id" element={<Restaurant />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/address" element={<Address />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App 