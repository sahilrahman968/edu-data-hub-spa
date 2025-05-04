
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import * as api from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";

interface FormData {
  id: string;
  name: string;
}

interface FormErrors {
  id?: string;
  name?: string;
}

export function BoardForm() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<FormErrors>({});

  const form = useForm<FormData>({
    defaultValues: {
      id: "",
      name: "",
    },
  });

  const validateForm = (data: FormData): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (!data.id || data.id.trim() === "") {
      newErrors.id = "ID is required";
    }
    
    if (!data.name || data.name.trim() === "") {
      newErrors.name = "Name is required";
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
      await api.createBoard(data.id, data.name);
      toast.success("Board created successfully");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    } catch (error) {
      console.error("Failed to create board:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Board</CardTitle>
        <CardDescription>Add a new educational board to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Board ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter unique board ID" {...field} />
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
                  <FormLabel>Board Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter board name" {...field} />
                  </FormControl>
                  {errors.name && <FormMessage>{errors.name}</FormMessage>}
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Board"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default BoardForm;
