import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import './App.css'
import Header from './components/Header.jsx';
import { Toaster } from 'react-hot-toast';
import RestaurantList from './components/RestaurantList.jsx';
import RestaurantDetail from './components/RestaurantDetail.jsx';
import Cart from './components/Cart.jsx';
import OrderHistory from './components/orders/OrderHistory.jsx';
import Login from './components/Login.jsx';
import Profile from './components/Profile';
import Register from './components/Register.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RestaurantOwnerDashboard from './components/restaurant-owner/RestaurantOwnerDashboard.jsx';
import RestaurantOwnerOrders from './components/orders/RestaurantOwnerOrders.jsx'
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import PaymentSuccess from './components/PaymentSuccess.jsx';
import PaystackPayment from './components/PaystackPayment.jsx';
import BankTransfer from './components/BankTransfer.jsx';

const AppRoutes = () => {
    const {user} = useAuth();
    return(
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<RestaurantList />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
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
                {user?.role === 'restaurant_owner' 
                  ? <RestaurantOwnerOrders /> 
                  : <OrderHistory />
                }
             </ProtectedRoute>
           } 
          />
          {/* <Route 
            path="/order/:orderId" 
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            } 
          /> */}
          {/* <Route 
            path="/track-order/:orderId" 
            element={
              <ProtectedRoute>
               <OrderTracking />
              </ProtectedRoute>
            } 
          /> */}
          <Route 
            path="/payment/card/:orderId" 
            element={
             <ProtectedRoute>
                <PaystackPayment />
             </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment/bank/:orderId" 
            element={
              <ProtectedRoute>
               <BankTransfer />
              </ProtectedRoute>
           } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
               <Profile />
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
    )

}

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
            duration: 5000,
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
              <AppRoutes/>
            </main>
          </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </>
  );
}

export default App;