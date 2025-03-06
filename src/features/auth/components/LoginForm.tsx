import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { LogIn } from "lucide-react";
import { login, setCurrentUser, DB_ENDPOINT } from "@/features/auth";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sqlQuery, setSqlQuery] = useState("");
  const [injectionSuccess, setInjectionSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInjectionSuccess(false);
    
    const demoQuery = `SELECT * FROM users WHERE email='${email}' AND password='${password}'`;
    setSqlQuery(demoQuery);
    
    try {
      console.log(`[DB CONNECTION]: Connecting to MySQL database at ${DB_ENDPOINT}`);
      
      const user = await login(email, password);
      
      if (user) {
        if (email.includes("'") || email.includes("--")) {
          setInjectionSuccess(true);
          console.log("[SECURITY ALERT]: Potential SQL injection detected in successful login");
        }
        
        setCurrentUser(user);
        toast({
          title: "Logged in successfully",
          description: `Welcome back, ${user.name}!`,
        });
        onLoginSuccess();
        navigate("/");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
      
      setLoading(false);
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
          <AlertTitle>Real SQL Injection Vulnerability</AlertTitle>
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
      
      {injectionSuccess && (
        <Alert variant="destructive" className="my-4 border-red-600">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security Breach Detected!</AlertTitle>
          <AlertDescription className="text-xs">
            SQL injection attack succeeded. This is a real vulnerability demonstration.
            In a production environment, this would grant unauthorized access.
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
    </form>
  );
};

export default LoginForm;
