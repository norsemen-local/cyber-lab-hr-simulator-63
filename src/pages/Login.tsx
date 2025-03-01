
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
        
        // If this is a new user (username is 'newuser'), redirect to wizard
        if (username === "newuser") {
          navigate("/");
        } else {
          navigate("/");
        }
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">HR Portal</CardTitle>
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
            <Button type="submit" className="w-full" disabled={loading}>
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
  );
};

export default Login;
