
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

export type QuestionType = "MULTIPLE_CORRECT_MCQ" | "SINGLE_CORRECT_MCQ" | "SUBJECTIVE" | "PASSAGE" | "MATCHING";
export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";
export type SourceType = "PREVIOUS_YEAR" | "AI_GENERATED" | "USER_GENERATED";

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface EvaluationRubric {
  criterion: string;
  weight: number;
  keywordHints?: string[];
}

export interface MatchItem {
  from: string;
  to: string;
}

export interface MatchingDetails {
  leftColumn: string[];
  rightColumn: string[];
  correctMatches: MatchItem[];
}

export interface PassageDetails {
  passageTitle?: string;
  passageText?: string;
}

export interface Creator {
  id: string;
  name: string;
}

export interface SyllabusMapping {
  board: Board;
  class: Class;
  subject: Subject;
  chapter: Chapter[];
  topic?: Topic[];
}

export interface FormData {
  id: string;
  parentId?: string | null;
  hasChild: boolean;
  questionTitle: string;
  markupQuestionTitle?: string;
  marks: number;
  difficulty: DifficultyLevel;
  questionType: QuestionType;
  options?: Option[];
  evaluationRubric?: EvaluationRubric[];
  passageDetails?: PassageDetails;
  matchingDetails?: MatchingDetails;
  year?: string;
  source: SourceType;
  createdBy: Creator;
  childIds?: string[];
  syllabusMapping: SyllabusMapping;
}

export interface ValidationErrors {
  [key: string]: string | ValidationErrors | Array<ValidationErrors | string>;
}

// Custom validation function for the form data
export function validateFormData(data: Partial<FormData>): ValidationErrors {
  const errors: ValidationErrors = {};

  // Required fields
  if (!data.id || data.id.trim() === "") {
    errors.id = "Question ID is required";
  }

  if (!data.questionTitle || data.questionTitle.trim() === "") {
    errors.questionTitle = "Question title is required";
  }

  if (data.marks === undefined || data.marks <= 0) {
    errors.marks = "Marks must be a positive number";
  }

  if (!data.difficulty) {
    errors.difficulty = "Difficulty is required";
  }

  if (!data.questionType) {
    errors.questionType = "Question type is required";
  }

  if (!data.source) {
    errors.source = "Source is required";
  }

  // Validate options for option_based questions
  if ((data.questionType === "SINGLE_CORRECT_MCQ" || data.questionType === "MULTIPLE_CORRECT_MCQ") && data.options) {
    const optionErrors: ValidationErrors[] = [];
    let hasError = false;

    data.options.forEach((option, index) => {
      const optionError: ValidationErrors = {};

      if (!option.id || option.id.trim() === "") {
        optionError.id = "Option ID is required";
        hasError = true;
      }

      if (!option.text || option.text.trim() === "") {
        optionError.text = "Option text is required";
        hasError = true;
      }

      optionErrors[index] = optionError;
    });

    if (hasError) {
      errors.options = optionErrors;
    }

    // Check if at least one option is marked as correct
    if (data.options.every(option => !option.isCorrect)) {
      if (!errors.options) {
        errors.options = [];
      }
      (errors.options as ValidationErrors[]).push({ general: "At least one option must be marked as correct" });
    }
  }

  // Validate evaluation rubric for subjective questions
  if (data.questionType === "SUBJECTIVE" && data.evaluationRubric) {
    const rubricErrors: ValidationErrors[] = [];
    let hasError = false;

    data.evaluationRubric.forEach((rubric, index) => {
      const rubricError: ValidationErrors = {};

      if (!rubric.criterion || rubric.criterion.trim() === "") {
        rubricError.criterion = "Criterion is required";
        hasError = true;
      }

      if (rubric.weight < 1) {
        rubricError.weight = "Weight must be at least 1";
        hasError = true;
      }

      rubricErrors[index] = rubricError;
    });

    if (hasError) {
      errors.evaluationRubric = rubricErrors;
    }
  }

  // Validate MATCHING details for MATCHING questions
  if (data.questionType === "MATCHING" && data.matchingDetails) {
    const matchingErrors: ValidationErrors = {};

    // Left column validation
    if (!data.matchingDetails.leftColumn || data.matchingDetails.leftColumn.length === 0) {
      matchingErrors.leftColumn = "Left column items are required";
    } else {
      const leftColumnErrors: ValidationErrors[] = [];
      let hasLeftError = false;

      data.matchingDetails.leftColumn.forEach((item, index) => {
        if (!item || item.trim() === "") {
          leftColumnErrors[index] = "Left column item is required";
          hasLeftError = true;
        }
      });

      if (hasLeftError) {
        matchingErrors.leftColumn = leftColumnErrors;
      }
    }

    // Right column validation
    if (!data.matchingDetails.rightColumn || data.matchingDetails.rightColumn.length === 0) {
      matchingErrors.rightColumn = "Right column items are required";
    } else {
      const rightColumnErrors: ValidationErrors[] = [];
      let hasRightError = false;

      data.matchingDetails.rightColumn.forEach((item, index) => {
        if (!item || item.trim() === "") {
          rightColumnErrors[index] = "Right column item is required";
          hasRightError = true;
        }
      });

      if (hasRightError) {
        matchingErrors.rightColumn = rightColumnErrors;
      }
    }

    // Correct matches validation
    if (!data.matchingDetails.correctMatches || data.matchingDetails.correctMatches.length === 0) {
      matchingErrors.correctMatches = "Correct matches are required";
    } else {
      const matchErrors: ValidationErrors[] = [];
      let hasMatchError = false;

      data.matchingDetails.correctMatches.forEach((match, index) => {
        const matchError: ValidationErrors = {};

        if (!match.from || match.from.trim() === "") {
          matchError.from = "From value is required";
          hasMatchError = true;
        }

        if (!match.to || match.to.trim() === "") {
          matchError.to = "To value is required";
          hasMatchError = true;
        }

        matchErrors[index] = matchError;
      });

      if (hasMatchError) {
        matchingErrors.correctMatches = matchErrors;
      }
    }

    if (Object.keys(matchingErrors).length > 0) {
      errors.matchingDetails = matchingErrors;
    }
  }

  // Validate year field if source is previous_year
  if (data.source === "PREVIOUS_YEAR" && (!data.year || data.year.trim() === "")) {
    errors.year = "Year is required for previous year questions";
  }

  // Validate syllabus mapping
  if (data.syllabusMapping) {
    const syllabusErrors: ValidationErrors = {};

    if (!data.syllabusMapping.board?.id || !data.syllabusMapping.board?.name) {
      syllabusErrors.board = "Board is required";
    }

    if (!data.syllabusMapping.class?.id || !data.syllabusMapping.class?.name) {
      syllabusErrors.class = "Class is required";
    }

    if (!data.syllabusMapping.subject?.id || !data.syllabusMapping.subject?.name) {
      syllabusErrors.subject = "Subject is required";
    }

    if (!data.syllabusMapping.chapter || data.syllabusMapping.chapter.length === 0) {
      syllabusErrors.chapter = "At least one chapter is required";
    } else {
      let hasInvalidChapter = false;
      data.syllabusMapping.chapter.forEach(chapter => {
        if (!chapter.id || !chapter.name) {
          hasInvalidChapter = true;
        }
      });
      if (hasInvalidChapter) {
        syllabusErrors.chapter = "Invalid chapter data";
      }
    }

    if (Object.keys(syllabusErrors).length > 0) {
      errors.syllabusMapping = syllabusErrors;
    }
  } else {
    errors.syllabusMapping = "Syllabus mapping is required";
  }

  return errors;
}

// Helper function to check if form has errors
export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

// Helper function to get nested error message
export function getErrorMessage(errors: ValidationErrors | undefined, path: string): string | undefined {
  if (!errors) return undefined;
  
  const pathParts = path.split('.');
  let current: any = errors;
  
  for (const part of pathParts) {
    if (current[part] === undefined) return undefined;
    current = current[part];
  }
  
  return typeof current === 'string' ? current : undefined;
}
