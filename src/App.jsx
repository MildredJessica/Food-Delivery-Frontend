import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import Header from './components/Header.jsx';
import RestaurantList from './components/RestaurantList.jsx';
import RestaurantDetail from './components/RestaurantDetail.jsx';
import Cart from './components/Cart.jsx';
import OrderHistory from './components/OrderHistory.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RestaurantOwnerDashboard from './components/restaurant-owner/RestaurantOwnerDashboard.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import PaymentSuccess from './components/PaymentSuccess.jsx';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            icon: '✅',
          },
          error: {
            duration: 4000,
            icon: '❌',
          },
        }}
      />
    
      <AuthProvider>
        <CartProvider>
          <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<RestaurantList />} />
                <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />

                {/* Protected routes */}
                <Route 
                  path="/cart" 
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders/" 
                  element={
                    <ProtectedRoute>
                      <OrderHistory />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/restaurant-owner/dashboard" 
                  element={
                    <ProtectedRoute>
                      <RestaurantOwnerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
          </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </>
  );
}

export default App;