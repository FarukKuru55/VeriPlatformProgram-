import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import UserPanel from './pages/UserPanel';
import PublicForm from './pages/PublicForm';
import ProtectedRoute from './components/ProtectedRoute'; // Yolun doğruluğundan emin ol

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} /> 
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/user" element={<UserPanel />} />
        <Route 
            path="/admin" 
            element={
                <ProtectedRoute>
                    <AdminPanel />
                </ProtectedRoute>
            } 
        />
        <Route path="/f/:slug" element={<PublicForm />} />
      </Routes>
    </BrowserRouter>
  );
}
