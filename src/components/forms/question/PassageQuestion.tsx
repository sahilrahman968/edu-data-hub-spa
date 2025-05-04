
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn, Controller } from "react-hook-form";
import { FormData, ValidationErrors, getErrorMessage } from "./types";

interface PassageQuestionProps {
  form: UseFormReturn<FormData>;
  errors: ValidationErrors;
}

export default function PassageQuestion({ form, errors }: PassageQuestionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Passage Details</h3>
      
      <Controller
        control={form.control}
        name="passageDetails.passageTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Passage Title</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            {getErrorMessage(errors, "passageDetails.passageTitle") && (
              <FormMessage>{getErrorMessage(errors, "passageDetails.passageTitle")}</FormMessage>
            )}
          </FormItem>
        )}
      />

      <Controller
        control={form.control}
        name="passageDetails.passageText"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Passage Text</FormLabel>
            <FormControl>
              <Textarea className="min-h-[200px]" {...field} />
            </FormControl>
            {getErrorMessage(errors, "passageDetails.passageText") && (
              <FormMessage>{getErrorMessage(errors, "passageDetails.passageText")}</FormMessage>
            )}
          </FormItem>
        )}
      />
    </div>
  );
}
