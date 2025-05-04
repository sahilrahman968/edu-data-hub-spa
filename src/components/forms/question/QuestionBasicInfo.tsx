
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn, Controller } from "react-hook-form";
import { FormData, Question, ValidationErrors, getErrorMessage } from "./types";

interface QuestionBasicInfoProps {
  form: UseFormReturn<FormData>;
  watchSource: "PREVIOUS_YEAR" | "AI_GENERATED" | "USER_GENERATED";
  watchHasChild: boolean;
  availableQuestions: Question[];
  errors: ValidationErrors;
}

export default function QuestionBasicInfo({ form, watchSource, watchHasChild, availableQuestions, errors }: QuestionBasicInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Question ID */}
        <Controller
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question ID*</FormLabel>
              <FormControl>
                <Input placeholder="Enter unique question ID" {...field} />
              </FormControl>
              {getErrorMessage(errors, "id") && (
                <FormMessage>{getErrorMessage(errors, "id")}</FormMessage>
              )}
            </FormItem>
          )}
        />

        {/* Parent Question ID */}
        <Controller
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Question ID</FormLabel>
              <Select
                value={field.value || "none"}
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent question (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {availableQuestions.map((question) => (
                    <SelectItem key={question.id} value={question.id}>
                      {question.id} - {question.questionTitle?.substring(0, 30)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getErrorMessage(errors, "parentId") && (
                <FormMessage>{getErrorMessage(errors, "parentId")}</FormMessage>
              )}
            </FormItem>
          )}
        />

        {/* Has Child */}
        <Controller
          control={form.control}
          name="hasChild"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Has Child Questions
                </FormLabel>
              </div>
              {getErrorMessage(errors, "hasChild") && (
                <FormMessage>{getErrorMessage(errors, "hasChild")}</FormMessage>
              )}
            </FormItem>
          )}
        />

        {/* Source */}
        <Controller
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source*</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PREVIOUS_YEAR">Previous Year</SelectItem>
                  <SelectItem value="AI_GENERATED">AI Generated</SelectItem>
                  <SelectItem value="USER_GENERATED">User Generated</SelectItem>
                </SelectContent>
              </Select>
              {getErrorMessage(errors, "source") && (
                <FormMessage>{getErrorMessage(errors, "source")}</FormMessage>
              )}
            </FormItem>
          )}
        />

        {/* Year (conditional based on source) */}
        {watchSource === "PREVIOUS_YEAR" && (
          <Controller
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter year (required for Previous Year)" {...field} />
                </FormControl>
                {getErrorMessage(errors, "year") && (
                  <FormMessage>{getErrorMessage(errors, "year")}</FormMessage>
                )}
              </FormItem>
            )}
          />
        )}

        {/* Only show these fields if hasChild is false */}
        {!watchHasChild && (
          <>
            {/* Marks */}
            <Controller
              control={form.control}
              name="marks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marks*</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))} 
                    />
                  </FormControl>
                  {getErrorMessage(errors, "marks") && (
                    <FormMessage>{getErrorMessage(errors, "marks")}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            {/* Difficulty */}
            <Controller
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty*</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EASY">EASY</SelectItem>
                      <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                      <SelectItem value="HARD">HARD</SelectItem>
                    </SelectContent>
                  </Select>
                  {getErrorMessage(errors, "difficulty") && (
                    <FormMessage>{getErrorMessage(errors, "difficulty")}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            {/* Question Type */}
            <Controller
              control={form.control}
              name="questionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type*</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SINGLE_CORRECT_MCQ">SINGLE CORRECT MCQ</SelectItem>
                      <SelectItem value="MULTIPLE_CORRECT_MCQ">MULTIPLE CORRECT MCQ</SelectItem>
                      <SelectItem value="SUBJECTIVE">SUBJECTIVE</SelectItem>
                      <SelectItem value="PASSAGE">PASSAGE</SelectItem>
                      <SelectItem value="MATCHING">MATCHING</SelectItem>
                    </SelectContent>
                  </Select>
                  {getErrorMessage(errors, "questionType") && (
                    <FormMessage>{getErrorMessage(errors, "questionType")}</FormMessage>
                  )}
                </FormItem>
              )}
            />
          </>
        )}
      </div>

      {/* Only show Question Title and Markup if hasChild is false */}
      {!watchHasChild && (
        <>
          {/* Question Title */}
          <Controller
            control={form.control}
            name="questionTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Title*</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter question text"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                {getErrorMessage(errors, "questionTitle") && (
                  <FormMessage>{getErrorMessage(errors, "questionTitle")}</FormMessage>
                )}
              </FormItem>
            )}
          />

          {/* Markup Question Title (optional) */}
          <Controller
            control={form.control}
            name="markupQuestionTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Markup Question Title (HTML)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter HTML markup for the question (optional)"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                {getErrorMessage(errors, "markupQuestionTitle") && (
                  <FormMessage>{getErrorMessage(errors, "markupQuestionTitle")}</FormMessage>
                )}
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
}
