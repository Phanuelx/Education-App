// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, isAuthenticated } = useAuth();
  
  // Not authenticated at all - redirect to login
  if (!isAuthenticated) {
    toast({
      title: "Authentication Required",
      description: "Please log in to access this page",
      variant: "destructive",
    });
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has the required role
  const hasRequiredRole = allowedRoles.length === 0 || 
    (currentUser && allowedRoles.includes(currentUser.role));
  
  // User doesn't have the required role - redirect to appropriate dashboard
  if (!hasRequiredRole) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this page",
      variant: "destructive",
    });
    
    // Redirect based on user role
    if (currentUser.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    } else if (currentUser.role === "TEACHER") {
      return <Navigate to="/teacher" replace />;
    } else if (currentUser.role === "STUDENT") {
      return <Navigate to="/student" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }
  
  // User has the required role - render the protected component
  return children;
};

export default ProtectedRoute;