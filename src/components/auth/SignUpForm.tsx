
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, Controller } from "react-hook-form";

interface FormData {
  id: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const SignUpForm = ({ onToggleForm }: { onToggleForm: () => void }) => {
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const form = useForm<FormData>({
    defaultValues: {
      id: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const validateForm = (data: FormData): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (!data.id || data.id.length < 3) {
      newErrors.id = "ID must be at least 3 characters";
    }
    
    if (!data.name || data.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!data.password || data.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!data.confirmPassword || data.confirmPassword.length < 6) {
      newErrors.confirmPassword = "Password must be at least 6 characters";
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    return newErrors;
  };

  const onSubmit = async (data: FormData) => {
    const formErrors = validateForm(data);
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      await signup(data.id, data.name, data.email, data.password);
      // Don't automatically toggle to login form - let the user see success message first
    } catch (error) {
      // Error handling is done in the AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>
          Sign up to start managing your educational content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID</FormLabel>
                  <FormControl>
                    <Input placeholder="teacher123" {...field} />
                  </FormControl>
                  {errors.id && <FormMessage>{errors.id}</FormMessage>}
                </FormItem>
              )}
            />
            
            <Controller
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  {errors.name && <FormMessage>{errors.name}</FormMessage>}
                </FormItem>
              )}
            />
            
            <Controller
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" {...field} />
                  </FormControl>
                  {errors.email && <FormMessage>{errors.email}</FormMessage>}
                </FormItem>
              )}
            />
            
            <Controller
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  {errors.password && <FormMessage>{errors.password}</FormMessage>}
                </FormItem>
              )}
            />
            
            <Controller
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  {errors.confirmPassword && <FormMessage>{errors.confirmPassword}</FormMessage>}
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button variant="link" className="p-0" onClick={onToggleForm}>
            Sign in
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;
