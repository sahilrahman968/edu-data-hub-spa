
import { useState, useEffect } from "react";
import { FormItem, FormControl, FormLabel, FormMessage, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { FormData } from "./types";
import { Plus, Trash2 } from "lucide-react";

interface MatchingQuestionProps {
  form: UseFormReturn<FormData>;
}

export default function MatchingQuestion({ form }: MatchingQuestionProps) {
  // Define left and right column arrays as regular state
  const [leftColumnItems, setLeftColumnItems] = useState<string[]>(['']);
  const [rightColumnItems, setRightColumnItems] = useState<string[]>(['']);

  const correctMatchesArray = useFieldArray({
    control: form.control,
    name: "matchingDetails.correctMatches",
  });

  // Add left column item
  const addLeftColumnItem = () => {
    setLeftColumnItems([...leftColumnItems, '']);
  };

  // Add right column item
  const addRightColumnItem = () => {
    setRightColumnItems([...rightColumnItems, '']);
  };

  // Update left column item
  const updateLeftColumnItem = (index: number, value: string) => {
    const newItems = [...leftColumnItems];
    newItems[index] = value;
    setLeftColumnItems(newItems);
    form.setValue('matchingDetails.leftColumn', newItems);
  };

  // Update right column item
  const updateRightColumnItem = (index: number, value: string) => {
    const newItems = [...rightColumnItems];
    newItems[index] = value;
    setRightColumnItems(newItems);
    form.setValue('matchingDetails.rightColumn', newItems);
  };

  // Remove left column item
  const removeLeftColumnItem = (index: number) => {
    if (leftColumnItems.length <= 1) return;
    const newItems = leftColumnItems.filter((_, i) => i !== index);
    setLeftColumnItems(newItems);
    form.setValue('matchingDetails.leftColumn', newItems);
  };

  // Remove right column item
  const removeRightColumnItem = (index: number) => {
    if (rightColumnItems.length <= 1) return;
    const newItems = rightColumnItems.filter((_, i) => i !== index);
    setRightColumnItems(newItems);
    form.setValue('matchingDetails.rightColumn', newItems);
  };

  // Update form values when component mounts or when items change
  useEffect(() => {
    form.setValue('matchingDetails', {
      leftColumn: leftColumnItems,
      rightColumn: rightColumnItems,
      correctMatches: form.getValues('matchingDetails')?.correctMatches || [{ from: "", to: "" }],
    });
  }, [form, leftColumnItems, rightColumnItems]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Left Column Items*</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLeftColumnItem}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </div>

        {leftColumnItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <FormItem className="flex-1">
              <FormControl>
                <Input 
                  placeholder="Left column item" 
                  value={item}
                  onChange={(e) => updateLeftColumnItem(index, e.target.value)} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeLeftColumnItem(index)}
              disabled={leftColumnItems.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Right Column Items*</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRightColumnItem}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </div>

        {rightColumnItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <FormItem className="flex-1">
              <FormControl>
                <Input 
                  placeholder="Right column item" 
                  value={item}
                  onChange={(e) => updateRightColumnItem(index, e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRightColumnItem(index)}
              disabled={rightColumnItems.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Correct Matches*</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => correctMatchesArray.append({ from: "", to: "" })}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Match
          </Button>
        </div>

        {correctMatchesArray.fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name={`matchingDetails.correctMatches.${index}.from`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From*</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select left item" />
                      </SelectTrigger>
                      <SelectContent>
                        {leftColumnItems.map((item, idx) => (
                          item && (
                            <SelectItem key={idx} value={item}>{item}</SelectItem>
                          )
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name={`matchingDetails.correctMatches.${index}.to`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To*</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select right item" />
                      </SelectTrigger>
                      <SelectContent>
                        {rightColumnItems.map((item, idx) => (
                          item && (
                            <SelectItem key={idx} value={item}>{item}</SelectItem>
                          )
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => correctMatchesArray.remove(index)}
                className="mt-8"
                disabled={correctMatchesArray.fields.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
