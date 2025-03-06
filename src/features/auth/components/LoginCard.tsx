
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "./LoginForm";
import DatabaseInfo from "./DatabaseInfo";

interface LoginCardProps {
  onLoginSuccess: () => void;
}

const LoginCard = ({ onLoginSuccess }: LoginCardProps) => {
  return (
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
        <LoginForm onLoginSuccess={onLoginSuccess} />
        <DatabaseInfo />
      </CardContent>
      <CardFooter className="flex-col space-y-2">
        <p className="text-xs text-center w-full text-gray-500">
          This application contains real security vulnerabilities for demonstration.
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginCard;
