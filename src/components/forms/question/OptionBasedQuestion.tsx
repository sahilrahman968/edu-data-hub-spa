
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "./types";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";

interface OptionBasedQuestionProps {
  form: UseFormReturn<FormData>;
}

export default function OptionBasedQuestion({ form }: OptionBasedQuestionProps) {
  const optionsArray = useFieldArray({
    control: form.control,
    name: "options",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Options</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => optionsArray.append({ id: String(optionsArray.fields.length + 1), text: "", isCorrect: false })}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Option
        </Button>
      </div>

      {optionsArray.fields.map((field, index) => (
        <div key={field.id} className="flex items-start space-x-2">
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name={`options.${index}.id`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Option ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-3">
                <FormField
                  control={form.control}
                  name={`options.${index}.text`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Option Text</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name={`options.${index}.isCorrect`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-3 h-full pb-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Correct</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => optionsArray.remove(index)}
            className="mt-6"
            disabled={optionsArray.fields.length <= 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
