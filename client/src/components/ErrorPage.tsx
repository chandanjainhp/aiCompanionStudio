import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
  title?: string;
  message?: string;
  code?: string;
  showHome?: boolean;
}

export function ErrorPage({
  title = 'Error',
  message = 'Something went wrong. Please try again.',
  code = '500',
  showHome = true,
}: ErrorPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">{code}</h1>
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          </div>

          <p className="text-center text-muted-foreground">{message}</p>

          <div className="flex gap-3">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            {showHome && (
              <Button onClick={() => navigate('/')} className="flex-1">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
