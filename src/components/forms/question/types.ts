
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
}).superRefine((data, ctx) => {
  // Only validate evaluation rubric if question type is subjective
  if (data.questionType === "subjective") {
    if (!data.evaluationRubric || data.evaluationRubric.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Evaluation rubric is required for subjective questions",
        path: ["evaluationRubric"]
      });
    } else {
      // Check each evaluation rubric item
      data.evaluationRubric.forEach((item, index) => {
        if (!item.criterion || item.criterion.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            minimum: 1,
            type: "string",
            inclusive: true,
            message: "Criterion is required",
            path: ["evaluationRubric", index, "criterion"]
          });
        }
      });
    }
  }

  // Only validate matching details if question type is matching
  if (data.questionType === "matching") {
    if (!data.matchingDetails) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Matching details are required for matching questions",
        path: ["matchingDetails"]
      });
    } else {
      // Check left column
      if (!data.matchingDetails.leftColumn || data.matchingDetails.leftColumn.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Left column items are required",
          path: ["matchingDetails", "leftColumn"]
        });
      } else {
        data.matchingDetails.leftColumn.forEach((item, index) => {
          if (!item || item.trim() === "") {
            ctx.addIssue({
              code: z.ZodIssueCode.too_small,
              minimum: 1,
              type: "string",
              inclusive: true,
              message: "Left column item is required",
              path: ["matchingDetails", "leftColumn", index]
            });
          }
        });
      }

      // Check right column
      if (!data.matchingDetails.rightColumn || data.matchingDetails.rightColumn.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Right column items are required",
          path: ["matchingDetails", "rightColumn"]
        });
      } else {
        data.matchingDetails.rightColumn.forEach((item, index) => {
          if (!item || item.trim() === "") {
            ctx.addIssue({
              code: z.ZodIssueCode.too_small,
              minimum: 1,
              type: "string",
              inclusive: true,
              message: "Right column item is required",
              path: ["matchingDetails", "rightColumn", index]
            });
          }
        });
      }

      // Check correct matches
      if (!data.matchingDetails.correctMatches || data.matchingDetails.correctMatches.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Correct matches are required",
          path: ["matchingDetails", "correctMatches"]
        });
      } else {
        data.matchingDetails.correctMatches.forEach((match, index) => {
          if (!match.from || match.from.trim() === "") {
            ctx.addIssue({
              code: z.ZodIssueCode.too_small,
              minimum: 1,
              type: "string",
              inclusive: true,
              message: "From value is required",
              path: ["matchingDetails", "correctMatches", index, "from"]
            });
          }
          if (!match.to || match.to.trim() === "") {
            ctx.addIssue({
              code: z.ZodIssueCode.too_small,
              minimum: 1,
              type: "string",
              inclusive: true,
              message: "To value is required",
              path: ["matchingDetails", "correctMatches", index, "to"]
            });
          }
        });
      }
    }
  }

  // Only validate year field if source is previous_year
  if (data.source === "previous_year" && (!data.year || data.year.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Year is required for previous year questions",
      path: ["year"]
    });
  }
});

export type FormData = z.infer<typeof formSchema>;
