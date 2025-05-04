
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import * as api from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useForm, Controller } from "react-hook-form";

// Import types
import { 
  FormData, 
  Board, 
  Class, 
  Subject, 
  Chapter, 
  Topic, 
  Question, 
  validateFormData, 
  ValidationErrors 
} from "./question/types";

// Import components
import QuestionBasicInfo from "./question/QuestionBasicInfo";
import OptionBasedQuestion from "./question/OptionBasedQuestion";
import SubjectiveQuestion from "./question/SubjectiveQuestion";
import PassageQuestion from "./question/PassageQuestion";
import MatchingQuestion from "./question/MatchingQuestion";
import SyllabusMapping from "./question/SyllabusMapping";

export default function QuestionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Get current user information from local storage
  const getUserFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // This is a simplified approach - in a real app, you'd decode the JWT
        // For now, we'll just use placeholder values
        return { id: "teacher_id", name: "Teacher Name" };
      }
      return { id: "", name: "" };
    } catch (error) {
      return { id: "", name: "" };
    }
  };

  const currentUser = getUserFromToken();

  const form = useForm<FormData>({
    defaultValues: {
      id: "",
      parentId: null,
      hasChild: false,
      questionTitle: "",
      markupQuestionTitle: "",
      marks: 0,
      difficulty: "medium",
      questionType: "option_based",
      options: [{ id: "1", text: "", isCorrect: false }],
      evaluationRubric: [{ criterion: "", weight: 1, keywordHints: [] }],
      passageDetails: { passageTitle: "", passageText: "" },
      matchingDetails: {
        leftColumn: [""],
        rightColumn: [""],
        correctMatches: [{ from: "", to: "" }],
      },
      year: "",
      source: "user_generated",
      createdBy: {
        id: currentUser.id,
        name: currentUser.name,
      },
      childIds: [],
      syllabusMapping: {
        board: { id: "", name: "" },
        class: { id: "", name: "" },
        subject: { id: "", name: "" },
        chapter: [{ id: "", name: "" }],
        topic: [{ id: "", name: "" }],
      },
    },
    mode: "onChange",
  });

  const watchQuestionType = form.watch("questionType");
  const watchSource = form.watch("source");

  // Fetch data using React Query
  const { data: boards = [] } = useQuery({
    queryKey: ['boards'],
    queryFn: api.getBoards,
    enabled: isAuthenticated,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', selectedBoardId],
    queryFn: () => api.getClasses(selectedBoardId),
    enabled: !!selectedBoardId && isAuthenticated,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', selectedClassId],
    queryFn: () => api.getSubjects(selectedClassId),
    enabled: !!selectedClassId && isAuthenticated,
  });

  const { data: chapters = [] } = useQuery({
    queryKey: ['chapters', selectedSubjectId],
    queryFn: () => api.getChapters(selectedSubjectId),
    enabled: !!selectedSubjectId && isAuthenticated,
  });

  const { data: topics = [] } = useQuery({
    queryKey: ['topics', selectedChapters],
    queryFn: () => api.getTopics(selectedChapters[0]),
    enabled: selectedChapters.length > 0 && isAuthenticated,
  });

  const { data: availableQuestions = [] } = useQuery({
    queryKey: ['questions', 'non-parents'],
    queryFn: () => api.getQuestions(), 
    enabled: isAuthenticated,
  });

  // Handle board selection
  const handleBoardChange = (boardId: string) => {
    const selectedBoard = (boards as Board[]).find((board: Board) => board.id === boardId);
    if (selectedBoard) {
      form.setValue("syllabusMapping.board.id", selectedBoard.id);
      form.setValue("syllabusMapping.board.name", selectedBoard.name);
      setSelectedBoardId(boardId);

      // Reset dependent fields
      form.setValue("syllabusMapping.class", { id: "", name: "" });
      form.setValue("syllabusMapping.subject", { id: "", name: "" });
      form.setValue("syllabusMapping.chapter", [{ id: "", name: "" }]);
      form.setValue("syllabusMapping.topic", [{ id: "", name: "" }]);
      setSelectedClassId("");
      setSelectedSubjectId("");
      setSelectedChapters([]);
    }
  };

  // Handle class selection
  const handleClassChange = (classId: string) => {
    const selectedClass = (classes as Class[]).find((cls: Class) => cls.id === classId);
    if (selectedClass) {
      form.setValue("syllabusMapping.class.id", selectedClass.id);
      form.setValue("syllabusMapping.class.name", selectedClass.name);
      setSelectedClassId(classId);

      // Reset dependent fields
      form.setValue("syllabusMapping.subject", { id: "", name: "" });
      form.setValue("syllabusMapping.chapter", [{ id: "", name: "" }]);
      form.setValue("syllabusMapping.topic", [{ id: "", name: "" }]);
      setSelectedSubjectId("");
      setSelectedChapters([]);
    }
  };

  // Handle subject selection
  const handleSubjectChange = (subjectId: string) => {
    const selectedSubject = (subjects as Subject[]).find((subject: Subject) => subject.id === subjectId);
    if (selectedSubject) {
      form.setValue("syllabusMapping.subject.id", selectedSubject.id);
      form.setValue("syllabusMapping.subject.name", selectedSubject.name);
      setSelectedSubjectId(subjectId);

      // Reset dependent fields
      form.setValue("syllabusMapping.chapter", [{ id: "", name: "" }]);
      form.setValue("syllabusMapping.topic", [{ id: "", name: "" }]);
      setSelectedChapters([]);
    }
  };

  // Handle chapter selection
  const handleChapterChange = (index: number, chapterId: string) => {
    const selectedChapter = (chapters as Chapter[]).find((chapter: Chapter) => chapter.id === chapterId);
    if (selectedChapter) {
      const updatedChapters = [...form.getValues("syllabusMapping.chapter")];
      updatedChapters[index] = { id: selectedChapter.id, name: selectedChapter.name };
      form.setValue("syllabusMapping.chapter", updatedChapters);

      // Update selected chapters for topic filtering
      const chapterIds = updatedChapters.map(ch => ch.id).filter(id => id !== "");
      setSelectedChapters(chapterIds);

      // Reset topics if all chapters are removed
      if (chapterIds.length === 0) {
        form.setValue("syllabusMapping.topic", [{ id: "", name: "" }]);
      }
    }
  };

  // Handle topic selection
  const handleTopicChange = (index: number, topicId: string) => {
    const selectedTopic = (topics as Topic[]).find((topic: Topic) => topic.id === topicId);
    if (selectedTopic) {
      const updatedTopics = [...form.getValues("syllabusMapping.topic")];
      updatedTopics[index] = { id: selectedTopic.id, name: selectedTopic.name };
      form.setValue("syllabusMapping.topic", updatedTopics);
    }
  };

  // Clean up irrelevant validation errors when question type changes
  useEffect(() => {
    const newErrors = { ...validationErrors };
    
    if (watchQuestionType !== 'subjective' && newErrors.evaluationRubric) {
      delete newErrors.evaluationRubric;
    }
    
    if (watchQuestionType !== 'matching' && newErrors.matchingDetails) {
      delete newErrors.matchingDetails;
    }
    
    if (watchQuestionType !== 'passage' && newErrors.passageDetails) {
      delete newErrors.passageDetails;
    }
    
    if (watchQuestionType !== 'option_based' && newErrors.options) {
      delete newErrors.options;
    }
    
    setValidationErrors(newErrors);
  }, [watchQuestionType]);

  // Clean up year validation error when source changes
  useEffect(() => {
    if (watchSource !== 'previous_year' && validationErrors.year) {
      const newErrors = { ...validationErrors };
      delete newErrors.year;
      setValidationErrors(newErrors);
    }
  }, [watchSource, validationErrors]);

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted with data:", data);
    
    // Custom validation
    const errors = validateFormData(data);
    
    // Don't validate fields that aren't relevant to the current question type
    if (data.questionType !== 'subjective' && errors.evaluationRubric) {
      delete errors.evaluationRubric;
    }
    
    if (data.questionType !== 'matching' && errors.matchingDetails) {
      delete errors.matchingDetails;
    }
    
    if (data.source !== 'previous_year' && errors.year) {
      delete errors.year;
    }
    
    setValidationErrors(errors);
    
    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors);
      toast.error("Please fix the form errors before submitting");
      return;
    }
    
    setIsLoading(true);

    // Create question payload based on question type
    let questionPayload: any = {
      id: data.id,
      parentId: data.parentId || null,
      hasChild: data.hasChild,
      questionTitle: data.questionTitle,
      markupQuestionTitle: data.markupQuestionTitle || data.questionTitle,
      marks: data.marks,
      difficulty: data.difficulty,
      questionType: [data.questionType], // API expects array
      source: data.source,
      createdBy: data.createdBy,
      syllabusMapping: data.syllabusMapping,
    };

    // Add year field only if it's a previous year question
    if (data.source === "previous_year") {
      questionPayload.year = data.year;
    }

    // Add question type specific fields
    if (data.questionType === "option_based" && data.options) {
      questionPayload.options = data.options;
    } else if (data.questionType === "subjective" && data.evaluationRubric) {
      questionPayload.evaluationRubric = data.evaluationRubric;
    } else if (data.questionType === "passage" && data.passageDetails) {
      questionPayload.passageDetails = data.passageDetails;
    } else if (data.questionType === "matching") {
      // For matching questions, get the values from our state
      questionPayload.matchingDetails = {
        leftColumn: data.matchingDetails?.leftColumn.filter(item => item.trim() !== '') || [],
        rightColumn: data.matchingDetails?.rightColumn.filter(item => item.trim() !== '') || [],
        correctMatches: data.matchingDetails?.correctMatches || []
      };
    }

    // Add child IDs if specified
    if (data.childIds && data.childIds.length > 0) {
      questionPayload.childIds = data.childIds;
    }

    try {
      console.log("Sending payload to createQuestion API:", questionPayload);
      await api.createQuestion(questionPayload);
      toast.success("Question created successfully");
      form.reset();
      setValidationErrors({});
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    } catch (error) {
      console.error("Failed to create question:", error);
      toast.error("Failed to create question");
    } finally {
      setIsLoading(false);
    }
  };

  // Debug submission - log form state whenever it changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log("Form changed:", name, type, value);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Manual submit handler for debugging
  const handleManualSubmit = () => {
    console.log("Manual submit clicked");
    console.log("Current form state:", form.getValues());
    console.log("Form errors:", validationErrors);
    form.handleSubmit(onSubmit)();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Question</CardTitle>
        <CardDescription>Add a new educational question to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Question Information */}
            <QuestionBasicInfo 
              form={form} 
              watchSource={watchSource} 
              availableQuestions={availableQuestions as Question[]}
              errors={validationErrors}
            />

            {/* Question Type Specific Fields */}
            {watchQuestionType === "option_based" && (
              <OptionBasedQuestion 
                form={form} 
                errors={validationErrors}
              />
            )}

            {watchQuestionType === "subjective" && (
              <SubjectiveQuestion 
                form={form} 
                errors={validationErrors}
              />
            )}

            {watchQuestionType === "passage" && (
              <PassageQuestion 
                form={form} 
                errors={validationErrors}
              />
            )}

            {watchQuestionType === "matching" && (
              <MatchingQuestion 
                form={form} 
                errors={validationErrors}
              />
            )}

            {/* Syllabus Mapping Section */}
            <SyllabusMapping
              form={form}
              boards={boards as Board[]}
              classes={classes as Class[]}
              subjects={subjects as Subject[]}
              chapters={chapters as Chapter[]}
              topics={topics as Topic[]}
              selectedBoardId={selectedBoardId}
              selectedClassId={selectedClassId}
              selectedSubjectId={selectedSubjectId}
              selectedChapters={selectedChapters}
              handleBoardChange={handleBoardChange}
              handleClassChange={handleClassChange}
              handleSubjectChange={handleSubjectChange}
              handleChapterChange={handleChapterChange}
              handleTopicChange={handleTopicChange}
              errors={validationErrors}
            />

            {/* Form Debugging Information */}
            <div className="bg-gray-100 p-4 rounded-md">
              <pre className="text-xs overflow-auto max-h-[100px]">
                {JSON.stringify(validationErrors, null, 2)}
              </pre>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Creating..." : "Create Question"}
              </Button>
              
              <Button type="button" onClick={handleManualSubmit} variant="secondary" className="flex-1">
                Debug Submit
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
