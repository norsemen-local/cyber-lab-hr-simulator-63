
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigate, useNavigate } from "react-router-dom";
import { register, getCurrentUser, setCurrentUser } from "../services/authService";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // If user is already logged in, redirect to home
  if (getCurrentUser()) {
    return <Navigate to="/" />;
  }
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !username || !password || !companyCode) {
      toast({
        title: "Registration failed",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Registration failed",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const user = register(username, password, name, companyCode);
      
      if (user) {
        setCurrentUser(user);
        toast({
          title: "Registration successful",
          description: "Welcome to the HR Portal!",
        });
        navigate("/");
      } else {
        toast({
          title: "Registration failed",
          description: "Invalid company code or username already exists",
          variant: "destructive",
        });
      }
      
      setLoading(false);
    }, 1000);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 relative overflow-hidden">
      {/* Geometric shapes */}
      <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-green-200 opacity-40 mix-blend-multiply animate-pulse"></div>
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-orange-200 opacity-40 mix-blend-multiply animate-pulse"></div>
      <div className="absolute bottom-40 right-40 w-40 h-40 rotate-45 bg-pink-200 opacity-30 mix-blend-multiply"></div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full p-4 z-10">
        <div className="hidden md:flex flex-col items-center justify-center">
          <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c" 
              alt="Office team" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
              <h2 className="text-white text-2xl font-bold">Join Your Team</h2>
              <p className="text-white/90">Create an account to access all HR resources</p>
            </div>
          </div>
        </div>

        <Card className="w-full shadow-lg border-none bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-center">
              Register to join your company's HR Portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  id="name" 
                  placeholder="Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/70"
                />
              </div>
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
              <div className="space-y-2">
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Confirm Password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/70"
                />
              </div>
              <div className="space-y-2">
                <Input 
                  id="companyCode" 
                  placeholder="Company Registration Code" 
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value)}
                  className="bg-white/70"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all" disabled={loading}>
                {loading ? 
                  "Registering..." : 
                  <>
                    <UserPlus className="mr-2 h-4 w-4" /> Register
                  </>
                }
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            <div className="text-center w-full">
              <span className="text-sm text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-sm font-medium text-primary hover:underline">
                Log in
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

export default Register;
