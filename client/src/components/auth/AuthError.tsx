import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

/**
 * Component shown when Google OAuth authentication fails
 */
const AuthError: React.FC = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Failed
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We encountered an error while trying to sign you in. This could be due to:
          </p>
          
          <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
            <li>• Network connectivity issues</li>
            <li>• Google OAuth service temporarily unavailable</li>
            <li>• Browser blocking third-party cookies</li>
          </ul>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={handleRetry}
            variant="primary"
            icon={<RefreshCw size={16} />}
            className="w-full"
          >
            Try Again
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthError;