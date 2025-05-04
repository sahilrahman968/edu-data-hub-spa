
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
  chapterId: string;
}

interface FormErrors {
  id?: string;
  name?: string;
  chapterId?: string;
}

export function TopicForm() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: chapters = [], isLoading: isLoadingChapters } = useQuery({
    queryKey: ["chapters"],
    queryFn: api.getChapters,
  });

  const form = useForm<FormData>({
    defaultValues: {
      id: "",
      name: "",
      chapterId: "",
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
    
    if (!data.chapterId || data.chapterId.trim() === "") {
      newErrors.chapterId = "Chapter is required";
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
      await api.createTopic(data.id, data.name, data.chapterId);
      toast.success("Topic created successfully");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    } catch (error) {
      console.error("Failed to create topic:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Topic</CardTitle>
        <CardDescription>Add a new topic to a chapter</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              control={form.control}
              name="chapterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Chapter</FormLabel>
                  <Select
                    disabled={isLoadingChapters}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a chapter" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {chapters.map((chapter) => (
                        <SelectItem key={chapter.id} value={chapter.id}>
                          {chapter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.chapterId && <FormMessage>{errors.chapterId}</FormMessage>}
                </FormItem>
              )}
            />
            
            <Controller
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter unique topic ID" {...field} />
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
                  <FormLabel>Topic Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter topic name" {...field} />
                  </FormControl>
                  {errors.name && <FormMessage>{errors.name}</FormMessage>}
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading || isLoadingChapters}>
              {isLoading ? "Creating..." : "Create Topic"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default TopicForm;
