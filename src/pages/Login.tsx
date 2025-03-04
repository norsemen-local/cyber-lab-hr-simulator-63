
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser, login, setCurrentUser } from "../services/authService";
import { useToast } from "@/components/ui/use-toast";
import { LogIn, AlertTriangle, Database } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// This would be the RDS endpoint in a real application
const DB_ENDPOINT = "hr-portal-db.cluster-xxxxxxxxxx.us-east-1.rds.amazonaws.com";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sqlQuery, setSqlQuery] = useState("");
  const [showDbInfo, setShowDbInfo] = useState(false);
  const { toast } = useToast();
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
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Show SQL query that would be executed
    const demoQuery = `SELECT * FROM users WHERE email='${email}' AND password='${password}'`;
    setSqlQuery(demoQuery);
    
    try {
      // Simulate connection to RDS
      console.log(`[DB CONNECTION]: Connecting to MySQL database at ${DB_ENDPOINT}`);
      
      // A small delay to simulate network latency to the database
      setTimeout(() => {
        // Call the login function which simulates executing SQL against a real database
        const user = login(email, password);
        
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
            description: "Invalid email or password",
            variant: "destructive",
          });
        }
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "A database error occurred during login",
        variant: "destructive",
      });
      setLoading(false);
    }
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
                  id="email" 
                  type="text"
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              
              {sqlQuery && (
                <Alert variant="destructive" className="my-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>SQL Injection Vulnerability</AlertTitle>
                  <AlertDescription className="font-mono text-xs break-all">
                    {sqlQuery}
                  </AlertDescription>
                  <AlertDescription className="mt-2 text-xs">
                    Try: <code className="bg-gray-100 p-1 rounded">admin@example.com' --</code> as email
                    <br />
                    Or: <code className="bg-gray-100 p-1 rounded">' OR '1'='1</code> as email
                  </AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all" disabled={loading}>
                {loading ? 
                  "Connecting to database..." : 
                  <>
                    <LogIn className="mr-2 h-4 w-4" /> Log In
                  </>
                }
              </Button>
              
              <div className="pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs" 
                  onClick={() => setShowDbInfo(!showDbInfo)}
                >
                  <Database className="mr-1 h-3 w-3" />
                  {showDbInfo ? "Hide" : "Show"} Database Information
                </Button>
                
                {showDbInfo && (
                  <div className="mt-2 p-3 bg-slate-50 rounded text-xs">
                    <p className="font-semibold">Database Configuration:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-700">
                      <li>Engine: MySQL 8.0</li>
                      <li>Host: {DB_ENDPOINT}</li>
                      <li>Schema: hr_portal</li>
                      <li>Table: users</li>
                      <li>Connection: Unencrypted (security vulnerability)</li>
                    </ul>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            <p className="text-xs text-center w-full text-gray-500">
              This application is intentionally vulnerable for security training.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
