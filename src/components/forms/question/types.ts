
import { z } from "zod";

// Define interfaces for our data types
export interface Board {
  id: string;
  name: string;
}

export interface Class {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Chapter {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
}

export interface Question {
  id: string;
  questionTitle?: string;
}

export const questionTypeSchema = z.enum(["option_based", "subjective", "passage", "matching"]);

export const optionSchema = z.object({
  id: z.string().min(1, { message: "Option ID is required" }),
  text: z.string().min(1, { message: "Option text is required" }),
  isCorrect: z.boolean().default(false),
});

export const evaluationRubricSchema = z.object({
  criterion: z.string().min(1, { message: "Criterion is required" }),
  weight: z.number().min(1, { message: "Weight must be at least 1" }),
  keywordHints: z.array(z.string()).optional(),
});

export const matchingSchema = z.object({
  leftColumn: z.array(z.string().min(1, { message: "Left column item is required" })),
  rightColumn: z.array(z.string().min(1, { message: "Right column item is required" })),
  correctMatches: z.array(z.object({
    from: z.string().min(1, { message: "From value is required" }),
    to: z.string().min(1, { message: "To value is required" }),
  })),
});

// Create a schema for the form with conditional validations
export const formSchema = z.object({
  id: z.string().min(1, { message: "Question ID is required" }),
  parentId: z.string().optional().nullable(),
  hasChild: z.boolean().default(false),
  questionTitle: z.string().min(1, { message: "Question title is required" }),
  markupQuestionTitle: z.string().optional(),
  marks: z.coerce.number().min(0, { message: "Marks must be a positive number" }),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionType: questionTypeSchema,
  options: z.array(optionSchema).optional(),
  evaluationRubric: z.array(evaluationRubricSchema).optional(),
  passageDetails: z.object({
    passageTitle: z.string().optional(),
    passageText: z.string().optional(),
  }).optional(),
  matchingDetails: matchingSchema.optional(),
  year: z.string().optional(),
  source: z.enum(["previous_year", "ai_generated", "user_generated"]),
  createdBy: z.object({
    id: z.string(),
    name: z.string(),
  }),
  childIds: z.array(z.string()).optional(),
  syllabusMapping: z.object({
    board: z.object({
      id: z.string().min(1, { message: "Board ID is required" }),
      name: z.string().min(1, { message: "Board name is required" }),
    }),
    class: z.object({
      id: z.string().min(1, { message: "Class ID is required" }),
      name: z.string().min(1, { message: "Class name is required" }),
    }),
    subject: z.object({
      id: z.string().min(1, { message: "Subject ID is required" }),
      name: z.string().min(1, { message: "Subject name is required" }),
    }),
    chapter: z.array(z.object({
      id: z.string().min(1, { message: "Chapter ID is required" }),
      name: z.string().min(1, { message: "Chapter name is required" }),
    })).min(1, { message: "At least one chapter is required" }),
    topic: z.array(z.object({
      id: z.string().min(1, { message: "Topic ID is required" }),
      name: z.string().min(1, { message: "Topic name is required" }),
    })).optional(),
  }),
}).refine((data) => {
  // If questionType is subjective, evaluationRubric is required
  if (data.questionType === "subjective") {
    return data.evaluationRubric && data.evaluationRubric.length > 0 && 
           data.evaluationRubric.every(item => item.criterion && item.criterion.trim() !== "");
  }
  return true;
}, {
  message: "Evaluation rubric is required for subjective questions",
  path: ["evaluationRubric"],
}).refine((data) => {
  // If questionType is matching, matchingDetails is required
  if (data.questionType === "matching") {
    return data.matchingDetails && 
           data.matchingDetails.leftColumn && data.matchingDetails.leftColumn.length > 0 && 
           data.matchingDetails.leftColumn.every(item => item && item.trim() !== "") && 
           data.matchingDetails.rightColumn && data.matchingDetails.rightColumn.length > 0 &&
           data.matchingDetails.rightColumn.every(item => item && item.trim() !== "") &&
           data.matchingDetails.correctMatches && data.matchingDetails.correctMatches.length > 0 &&
           data.matchingDetails.correctMatches.every(match => match.from && match.from.trim() !== "" && match.to && match.to.trim() !== "");
  }
  return true;
}, {
  message: "Matching details are required for matching questions",
  path: ["matchingDetails"],
}).refine((data) => {
  // If source is previous_year, year is required
  if (data.source === "previous_year") {
    return data.year && data.year.trim() !== "";
  }
  return true;
}, {
  message: "Year is required for previous year questions",
  path: ["year"],
});

export type FormData = z.infer<typeof formSchema>;
