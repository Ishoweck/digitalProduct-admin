// import React from 'react'
import "./index.css"
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'


// pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Vendors from './pages/Vendors'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Payments from './pages/Payments'
import Reviews from './pages/Reviews'
import Categories from './pages/Categories'
import Wallet from './pages/Wallet'
import VendorDetails from './pages/VendorDetails'
import UserDetails from "./pages/UserDetails"
import ProductDetails from "./pages/ProductDetails";
import OrderDetails from "./pages/OrderDetails";
import PaymentDetails from "./pages/PaymentDetails";
import AdminSignup from "./pages/AdminSignup"
import RequireSuperAdmin from "./components/RequireSuperAdmin"
import Withdrawals from "./pages/Withdrwals"


export default function App() {
  const { token } = useAuth()

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="vendors" element={<Vendors />} />
                  <Route path="products" element={<Products />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="payments" element={<Payments />} />
                  <Route path="reviews" element={<Reviews />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="wallet" element={<Wallet />} />
                  <Route path="vendors/:id" element={<VendorDetails />} />
                  <Route path="users/:id" element={<UserDetails />} />
                  <Route path="products/:id" element={<ProductDetails />} />
                  <Route path="/orders/:id" element={<OrderDetails />} />
                  <Route path="/payments/:paymentId" element={<PaymentDetails />} />
                  <Route path="/withdrawals" element={
                    <RequireSuperAdmin>
                            <Withdrawals />

                    </RequireSuperAdmin>
              
                    
                   } />

                    <Route
    path="/signup"
    element={
      <RequireSuperAdmin>
        <AdminSignup />
      </RequireSuperAdmin>
    }
  />





                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={token ? '/admin/dashboard' : '/login'} replace />} />
      </Routes>
    </>
  )
}
