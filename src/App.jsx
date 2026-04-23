import React, { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getMe } from './store/slices/authSlice'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import AddProduct from './components/AddProduct'
import ProductDetails from './pages/ProductDetails'
import Projects from './pages/Projects'
import Achievements from './pages/Achievements'
import Enquiries from './pages/Enquiries'
import ContactMessages from './pages/ContactMessages'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Clients from './pages/Clients'
import Category from './pages/Category';
import Testimonials from './pages/Testimonials'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  const dispatch = useDispatch()
  const { token, user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (token && !user) {
      dispatch(getMe())
    }
  }, [token, user, dispatch])

  return (
    <BrowserRouter>
      <Toaster position="center-top" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<AddProduct />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="projects" element={<Projects />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="contacts" element={<ContactMessages />} />
          <Route path="clients" element={<Clients />} />
          <Route path="category" element={<Category />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<div className="p-8 text-center text-slate-500">Page under construction</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
