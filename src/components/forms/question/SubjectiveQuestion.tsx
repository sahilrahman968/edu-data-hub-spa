
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn, Controller, useFieldArray } from "react-hook-form";
import { FormData, ValidationErrors, getErrorMessage } from "./types";
import { Plus, Trash2 } from "lucide-react";

interface SubjectiveQuestionProps {
  form: UseFormReturn<FormData>;
  errors: ValidationErrors;
}

export default function SubjectiveQuestion({ form, errors }: SubjectiveQuestionProps) {
  const evaluationRubricArray = useFieldArray({
    control: form.control,
    name: "evaluationRubric",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Evaluation Rubric*</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => evaluationRubricArray.append({ criterion: "", weight: 1, keywordHints: [] })}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Criterion
        </Button>
      </div>

      {evaluationRubricArray.fields.map((field, index) => (
        <div key={field.id} className="flex items-start space-x-2">
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <Controller
                  control={form.control}
                  name={`evaluationRubric.${index}.criterion`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Criterion*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      {errors.evaluationRubric && 
                       Array.isArray(errors.evaluationRubric) && 
                       errors.evaluationRubric[index] && 
                       (errors.evaluationRubric[index] as ValidationErrors).criterion && (
                        <FormMessage>
                          {(errors.evaluationRubric[index] as ValidationErrors).criterion as string}
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-1">
                <Controller
                  control={form.control}
                  name={`evaluationRubric.${index}.weight`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))} 
                        />
                      </FormControl>
                      {errors.evaluationRubric && 
                       Array.isArray(errors.evaluationRubric) && 
                       errors.evaluationRubric[index] && 
                       (errors.evaluationRubric[index] as ValidationErrors).weight && (
                        <FormMessage>
                          {(errors.evaluationRubric[index] as ValidationErrors).weight as string}
                        </FormMessage>
                      )}
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
            onClick={() => evaluationRubricArray.remove(index)}
            className="mt-6"
            disabled={evaluationRubricArray.fields.length <= 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
