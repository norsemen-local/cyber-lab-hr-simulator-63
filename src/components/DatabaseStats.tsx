
import { useState, useEffect } from 'react';
import { Database, Users } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { DB_ENDPOINT } from '../features/auth/constants';

interface DbStats {
  userCount: number;
  loading: boolean;
  error: string | null;
}

const DatabaseStats = () => {
  const [stats, setStats] = useState<DbStats>({
    userCount: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDatabaseStats = async () => {
      try {
        // Make an actual API call to the backend
        const response = await fetch('/api/database/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch database statistics');
        }
        
        const data = await response.json();
        setStats({
          userCount: data.userCount || 0,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching database stats:', error);
        setStats({
          userCount: 0,
          loading: false,
          error: 'Failed to load database statistics'
        });
        
        toast({
          title: "Database Connection Error",
          description: "Could not connect to database to fetch statistics",
          variant: "destructive"
        });
      }
    };

    // Call the actual API function
    fetchDatabaseStats();
  }, []);

  return (
    <div className="flex items-center gap-6 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4" />
        <span>Database: {DB_ENDPOINT}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        {stats.loading ? (
          <span>Loading user count...</span>
        ) : stats.error ? (
          <span className="text-red-500">Error loading user count</span>
        ) : (
          <span>Users: {stats.userCount}</span>
        )}
      </div>
    </div>
  );
};

export default DatabaseStats;
