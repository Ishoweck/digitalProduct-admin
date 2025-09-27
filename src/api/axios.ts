import axios from 'axios'
// import { useAuth } from '../context/AuthContext'
import Cookies from 'js-cookie'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // ⬅️ replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach token to requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')

    // console.log("This is token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default api
