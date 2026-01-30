import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Inventory from './pages/admin/Inventory'
import SaleManager from './pages/admin/SaleManager'
import Testimonials from './pages/admin/Testimonials'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import SaleTimer from './components/product/SaleTimer'
import AdminLayout from './components/layout/AdminLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <SaleTimer />
              <main className="flex-1">
                <Home />
              </main>
              <Footer />
            </div>
          }
        />

        {/* Cart & Checkout Routes */}
        <Route
          path="/cart"
          element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                <Cart />
              </main>
              <Footer />
            </div>
          }
        />
        <Route
          path="/checkout"
          element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                <Checkout />
              </main>
              <Footer />
            </div>
          }
        />
        <Route
          path="/order-confirmation/:orderId"
          element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                <OrderConfirmation />
              </main>
              <Footer />
            </div>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Inventory />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sales"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <SaleManager />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/testimonials"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Testimonials />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
