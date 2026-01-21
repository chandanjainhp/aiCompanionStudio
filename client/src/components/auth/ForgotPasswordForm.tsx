import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
    email: z.string().email('Please enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
    const navigate = useNavigate();
    const { sendOTP, isLoading } = useAuthStore();
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormValues) => {
        try {
            console.log('📡 [ForgotPasswordForm] Sending reset OTP to:', data.email);
            await sendOTP(data.email, 'reset_password');

            toast({
                title: 'OTP Sent',
                description: 'Please check your email for the verification code',
            });

            navigate('/verify-otp', {
                state: { email: data.email, mode: 'reset_password' },
            });
        } catch (error) {
            console.error('❌ [ForgotPasswordForm] Error:', error);
            toast({
                title: 'Request failed',
                description: error instanceof Error ? error.message : 'Could not process request',
                variant: 'destructive',
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="border-border/50 shadow-strong">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-glow">
                        <Mail className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                        <CardDescription className="mt-2">
                            Enter your email to receive a password reset code
                        </CardDescription>
                    </div>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                {...register('email')}
                                className={errors.email ? 'border-destructive' : ''}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending code...
                                </>
                            ) : (
                                'Send Reset Code'
                            )}
                        </Button>
                        <Link
                            to="/login"
                            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to login
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </motion.div>
    );
}
