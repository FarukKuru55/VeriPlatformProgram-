import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');

    // Eğer bilet yoksa, AdminPanel'e hiç girmeyi deneme bile, direkt Login'e yolla
    if (!token) {
        return <Navigate to="/" replace />;
    }

    return children;
}