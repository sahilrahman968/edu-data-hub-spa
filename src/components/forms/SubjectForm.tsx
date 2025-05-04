
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

// Define interfaces for our data types
interface Class {
  id: string;
  name: string;
}

interface FormData {
  id: string;
  name: string;
  classId: string;
}

interface FormErrors {
  id?: string;
  name?: string;
  classId?: string;
}

export function SubjectForm() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedClassId, setSelectedClassId] = useState("");
  const [className, setClassName] = useState("");

  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ["classes"],
    queryFn: api.getClasses,
  });

  const form = useForm<FormData>({
    defaultValues: {
      id: "",
      name: "",
      classId: "",
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
    
    if (!data.classId || data.classId.trim() === "") {
      newErrors.classId = "Class is required";
    }
    
    return newErrors;
  };

  const handleClassChange = (classId: string) => {
    // Add type assertion to specify that items in classes array conform to the Class interface
    const selectedClass = (classes as Class[]).find((cls: Class) => cls.id === classId);
    if (selectedClass) {
      setSelectedClassId(classId);
      setClassName(selectedClass.name);
    }
  };

  const onSubmit = async (data: FormData) => {
    const formErrors = validateForm(data);
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      await api.createSubject(data.id, data.name, data.classId);
      toast.success("Subject created successfully");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    } catch (error) {
      console.error("Failed to create subject:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Subject</CardTitle>
        <CardDescription>Add a new subject to a class</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Class</FormLabel>
                  <Select
                    disabled={isLoadingClasses}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleClassChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Add type assertion for classes array */}
                      {(classes as Class[]).map((cls: Class) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.classId && <FormMessage>{errors.classId}</FormMessage>}
                </FormItem>
              )}
            />
            
            <Controller
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter unique subject ID" {...field} />
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
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter subject name" {...field} />
                  </FormControl>
                  {errors.name && <FormMessage>{errors.name}</FormMessage>}
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading || isLoadingClasses}>
              {isLoading ? "Creating..." : "Create Subject"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default SubjectForm;
