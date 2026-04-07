import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Loader2, Mail, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
export function OTPLoginForm() {
  const [email, setEmail] = useState('');
  const {
    sendOTP,
    isLoading
  } = useAuthStore();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const handleSendOTP = async e => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }
    try {
      // Send OTP using authStore - sets otpSent, otpEmail, otpMode
      await sendOTP(email, 'login');
      toast({
        title: 'OTP sent',
        description: `We've sent a verification code to ${email}`
      });

      // Navigate to OTP verification page
      navigate('/verify-otp', {
        state: {
          email,
          mode: 'login'
        }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send OTP';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive'
      });
    }
  };
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.4
  }}>
      <Card className="border-border/50 shadow-strong w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-glow">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription className="mt-2">
              Sign in with OTP or password
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSendOTP}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} required />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90" disabled={isLoading}>
              {isLoading ? <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending OTP...
                </> : <>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Send OTP
                </>}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted-foreground/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Link to="/login" className="w-full">
              <Button type="button" variant="outline" className="w-full">
                Use Password Instead
              </Button>
            </Link>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Create one
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>;
}