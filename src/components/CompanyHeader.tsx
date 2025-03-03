
import { Building2 } from "lucide-react";

interface CompanyHeaderProps {
  showLogo?: boolean;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const CompanyHeader = ({ showLogo = true, showName = true, size = 'md' }: CompanyHeaderProps) => {
  const logoSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };
  
  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  };
  
  return (
    <div className="flex items-center gap-2">
      {showLogo && (
        <div className="flex-shrink-0">
          <Building2 className={`text-purple-600 ${logoSizes[size]}`} />
        </div>
      )}
      {showName && (
        <h2 className={`font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${textSizes[size]}`}>
          TechPro Solutions
        </h2>
      )}
    </div>
  );
};

export default CompanyHeader;
