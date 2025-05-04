
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
  boardId: string;
}

interface FormErrors {
  id?: string;
  name?: string;
  boardId?: string;
}

export function ClassForm() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: boards = [], isLoading: isLoadingBoards } = useQuery({
    queryKey: ["boards"],
    queryFn: api.getBoards,
  });

  const form = useForm<FormData>({
    defaultValues: {
      id: "",
      name: "",
      boardId: "",
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
    
    if (!data.boardId || data.boardId.trim() === "") {
      newErrors.boardId = "Board is required";
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
      await api.createClass(data.id, data.name, data.boardId);
      toast.success("Class created successfully");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    } catch (error) {
      console.error("Failed to create class:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Class</CardTitle>
        <CardDescription>Add a new class to a board</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              control={form.control}
              name="boardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Board</FormLabel>
                  <Select
                    disabled={isLoadingBoards}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a board" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {boards.map((board) => (
                        <SelectItem key={board.id} value={board.id}>
                          {board.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.boardId && <FormMessage>{errors.boardId}</FormMessage>}
                </FormItem>
              )}
            />
            
            <Controller
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter unique class ID" {...field} />
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
                  <FormLabel>Class Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter class name" {...field} />
                  </FormControl>
                  {errors.name && <FormMessage>{errors.name}</FormMessage>}
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading || isLoadingBoards}>
              {isLoading ? "Creating..." : "Create Class"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default ClassForm;
