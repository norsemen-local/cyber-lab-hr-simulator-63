
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
  type?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend, 
  className, 
  onClick,
  type = 'default'
}: StatCardProps) => {
  // Card type styling
  const cardStyles = {
    default: "border-none shadow-md bg-white/80 backdrop-blur-sm",
    primary: "border-none shadow-md bg-gradient-to-br from-blue-50 to-purple-50 border-l-4 border-l-purple-500",
    secondary: "border-none shadow-md bg-gradient-to-br from-gray-50 to-blue-50 border-l-4 border-l-blue-500",
    success: "border-none shadow-md bg-gradient-to-br from-green-50 to-teal-50 border-l-4 border-l-green-500",
    warning: "border-none shadow-md bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-l-yellow-500",
    danger: "border-none shadow-md bg-gradient-to-br from-red-50 to-pink-50 border-l-4 border-l-red-500",
  };
  
  // Icon background styling
  const iconStyles = {
    default: "bg-purple-100",
    primary: "bg-purple-100",
    secondary: "bg-blue-100",
    success: "bg-green-100",
    warning: "bg-yellow-100",
    danger: "bg-red-100",
  };

  return (
    <Card 
      className={cn(
        cardStyles[type],
        "hover:shadow-lg transition-all", 
        onClick ? "cursor-pointer" : "",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {trend && (
              <div className="flex items-center mt-1">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            )}
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
          </div>
          <div className={`p-3 rounded-full ${iconStyles[type]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
