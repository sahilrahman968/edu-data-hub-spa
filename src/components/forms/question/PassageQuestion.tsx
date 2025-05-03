
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "./types";

interface PassageQuestionProps {
  form: UseFormReturn<FormData>;
}

export default function PassageQuestion({ form }: PassageQuestionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Passage Details</h3>
      
      <FormField
        control={form.control}
        name="passageDetails.passageTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Passage Title</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="passageDetails.passageText"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Passage Text</FormLabel>
            <FormControl>
              <Textarea className="min-h-[200px]" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
