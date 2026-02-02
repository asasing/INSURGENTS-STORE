import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Category from './pages/Category'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Loading from './pages/Loading'
import OrderSuccess from './pages/OrderSuccess'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Orders from './pages/admin/Orders'
import Inventory from './pages/admin/Inventory'
import DiscountsAndPromos from './pages/admin/DiscountsAndPromos'
import ShippingZones from './pages/admin/ShippingZones'
import Promotions from './pages/admin/Promotions'
import Testimonials from './pages/admin/Testimonials'
import Settings from './pages/admin/Settings'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import SaleTimer from './components/product/SaleTimer'
import AdminLayout from './components/layout/AdminLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { useSiteSettings } from './hooks/useSiteSettings'

function App() {
  // Load site settings and update favicon/title dynamically
  useSiteSettings()

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

        {/* Category Route */}
        <Route
          path="/category/:slug"
          element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <SaleTimer />
              <main className="flex-1">
                <Category />
              </main>
              <Footer />
            </div>
          }
        />

        {/* Product Detail Route */}
        <Route
          path="/product/:id"
          element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                <ProductDetail />
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

        {/* Loading and Success Routes */}
        <Route path="/loading" element={<Loading />} />
        <Route path="/order-success" element={<OrderSuccess />} />

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
          path="/admin/discounts"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <DiscountsAndPromos />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shipping"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ShippingZones />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Orders />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/promotions"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Promotions />
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
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Settings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
