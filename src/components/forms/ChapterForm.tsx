
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import * as api from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";

interface FormData {
  id: string;
  name: string;
  subjectId: string;
}

interface FormErrors {
  id?: string;
  name?: string;
  subjectId?: string;
}

export function ChapterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: api.getSubjects,
  });

  const form = useForm<FormData>({
    defaultValues: {
      id: "",
      name: "",
      subjectId: "",
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
    
    if (!data.subjectId || data.subjectId.trim() === "") {
      newErrors.subjectId = "Subject is required";
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
      await api.createChapter(data.id, data.name, data.subjectId);
      toast.success("Chapter created successfully");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    } catch (error) {
      console.error("Failed to create chapter:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Chapter</CardTitle>
        <CardDescription>Add a new chapter to a subject</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Subject</FormLabel>
                  <Select
                    disabled={isLoadingSubjects}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subjectId && <FormMessage>{errors.subjectId}</FormMessage>}
                </FormItem>
              )}
            />
            
            <Controller
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chapter ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter unique chapter ID" {...field} />
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
                  <FormLabel>Chapter Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter chapter name" {...field} />
                  </FormControl>
                  {errors.name && <FormMessage>{errors.name}</FormMessage>}
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading || isLoadingSubjects}>
              {isLoading ? "Creating..." : "Create Chapter"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default ChapterForm;
