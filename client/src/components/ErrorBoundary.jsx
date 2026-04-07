import { Component } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full mx-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                  <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                <Button onClick={() => window.location.reload()} className="w-full" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
              </div>
            </div>
          </div>;
    }
    return this.props.children;
  }
}