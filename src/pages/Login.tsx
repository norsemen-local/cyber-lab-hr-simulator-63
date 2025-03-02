import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigate, useNavigate } from "react-router-dom";
import { login, getCurrentUser, setCurrentUser } from "../services/authService";
import { useToast } from "@/components/ui/use-toast";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // If user is already logged in, redirect to home
  if (getCurrentUser()) {
    return <Navigate to="/" />;
  }
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const user = login(username, password);
      
      if (user) {
        setCurrentUser(user);
        toast({
          title: "Logged in successfully",
          description: `Welcome back, ${user.name}!`,
        });
        navigate("/");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
      }
      
      setLoading(false);
    }, 1000);
  };
  
  return (
    <div className="min-h-[calc(100vh-49px)] flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 relative overflow-hidden">
      {/* Geometric shapes */}
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-yellow-200 opacity-40 mix-blend-multiply animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-blue-200 opacity-40 mix-blend-multiply animate-pulse"></div>
      <div className="absolute top-40 right-40 w-40 h-40 rounded-lg bg-pink-200 opacity-30 mix-blend-multiply rotate-12"></div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full p-4 z-10">
        <div className="hidden md:flex flex-col items-center justify-center">
          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81" 
              alt="Team collaborating" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
              <h2 className="text-white text-2xl font-bold">Welcome Back!</h2>
              <p className="text-white/90">Login to access your HR tools and team resources</p>
            </div>
          </div>
        </div>

        <Card className="w-full shadow-lg border-none bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HR Portal
            </CardTitle>
            <CardDescription className="text-center">
              Login to access your employee dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  id="username" 
                  placeholder="Username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/70"
                />
              </div>
              <div className="space-y-2">
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/70"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all" disabled={loading}>
                {loading ? 
                  "Logging in..." : 
                  <>
                    <LogIn className="mr-2 h-4 w-4" /> Log In
                  </>
                }
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            <div className="text-center w-full">
              <span className="text-sm text-muted-foreground">Don't have an account? </span>
              <Link to="/register" className="text-sm font-medium text-primary hover:underline">
                Register
              </Link>
            </div>
            <p className="text-xs text-center w-full text-gray-500">
              This application is deliberately vulnerable for security training purposes.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
