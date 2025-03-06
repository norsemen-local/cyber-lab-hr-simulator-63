
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import LoginHero from "@/features/auth/components/LoginHero";
import LoginCard from "@/features/auth/components/LoginCard";

const Login = () => {
  const navigate = useNavigate();
  
  // Check session storage on component mount
  useEffect(() => {
    // If user is already logged in (from session storage), no need to show login page
    const user = getCurrentUser();
    if (user) {
      navigate("/");
    }
  }, [navigate]);
  
  // If user is already logged in, redirect to home
  if (getCurrentUser()) {
    return <Navigate to="/" />;
  }

  const handleLoginSuccess = () => {
    // This function can be used to perform any actions needed upon successful login
    console.log("Login successful");
  };
  
  return (
    <div className="min-h-[calc(100vh-49px)] flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 relative overflow-hidden">
      {/* Geometric shapes for visual appeal */}
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-yellow-200 opacity-40 mix-blend-multiply animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-blue-200 opacity-40 mix-blend-multiply animate-pulse"></div>
      <div className="absolute top-40 right-40 w-40 h-40 rounded-lg bg-pink-200 opacity-30 mix-blend-multiply rotate-12"></div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full p-4 z-10">
        <LoginHero />
        <LoginCard onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default Login;
