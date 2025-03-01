
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
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
              />
            </div>
            <div className="space-y-2">
              <Input 
                id="username" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Input 
                id="password" 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="Confirm Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Input 
                id="companyCode" 
                placeholder="Company Registration Code" 
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
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
  );
};

export default Register;
