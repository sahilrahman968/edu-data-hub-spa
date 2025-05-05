
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import * as api from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useForm, Controller } from "react-hook-form";
import { Plus, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

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
  const [childQuestions, setChildQuestions] = useState<FormData[]>([]);
  const [isParentCreated, setIsParentCreated] = useState(false);
  const [parentQuestion, setParentQuestion] = useState<FormData | null>(null);
  const [questionMode, setQuestionMode] = useState<"standard" | "parent-child">("standard");
  const [mode, setMode] = useState<"parent" | "child">("parent");

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
      difficulty: "MEDIUM",
      questionType: "SINGLE_CORRECT_MCQ",
      options: [{ id: "1", text: "", isCorrect: false }],
      evaluationRubric: [{ criterion: "", weight: 1, keywordHints: [] }],
      passageDetails: { passageTitle: "", passageText: "" },
      matchingDetails: {
        leftColumn: [""],
        rightColumn: [""],
        correctMatches: [{ from: "", to: "" }],
      },
      year: "",
      source: "USER_GENERATED",
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

  const resetFormForChildQuestion = () => {
    if (!parentQuestion) return;
    
    form.reset({
      id: "",
      parentId: parentQuestion.id,
      hasChild: false,
      questionTitle: "",
      markupQuestionTitle: "",
      marks: 0,
      difficulty: "MEDIUM",
      questionType: "SINGLE_CORRECT_MCQ",
      options: [{ id: "1", text: "", isCorrect: false }],
      evaluationRubric: [{ criterion: "", weight: 1, keywordHints: [] }],
      passageDetails: { passageTitle: "", passageText: "" },
      matchingDetails: {
        leftColumn: [""],
        rightColumn: [""],
        correctMatches: [{ from: "", to: "" }],
      },
      year: parentQuestion.year || "",
      source: parentQuestion.source,
      createdBy: parentQuestion.createdBy,
      childIds: [],
      syllabusMapping: {
        board: { id: "", name: "" },
        class: { id: "", name: "" },
        subject: { id: "", name: "" },
        chapter: [{ id: "", name: "" }],
        topic: [{ id: "", name: "" }],
      },
    });
    
    setValidationErrors({});
  };

  const resetEntireForm = () => {
    form.reset({
      id: "",
      parentId: null,
      hasChild: questionMode === "parent-child", // Set hasChild based on mode
      questionTitle: "",
      markupQuestionTitle: "",
      marks: 0,
      difficulty: "MEDIUM",
      questionType: "SINGLE_CORRECT_MCQ",
      options: [{ id: "1", text: "", isCorrect: false }],
      evaluationRubric: [{ criterion: "", weight: 1, keywordHints: [] }],
      passageDetails: { passageTitle: "", passageText: "" },
      matchingDetails: {
        leftColumn: [""],
        rightColumn: [""],
        correctMatches: [{ from: "", to: "" }],
      },
      year: "",
      source: "USER_GENERATED",
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
    });
    
    setIsParentCreated(false);
    setParentQuestion(null);
    setChildQuestions([]);
    setValidationErrors({});
    setMode("parent");
  };

  // Handle mode change
  const handleModeChange = (newMode: "standard" | "parent-child") => {
    setQuestionMode(newMode);
    resetEntireForm();
    
    // Update hasChild based on the selected mode
    form.setValue("hasChild", newMode === "parent-child");
  };

  const watchQuestionType = form.watch("questionType");
  const watchSource = form.watch("source");
  const watchHasChild = form.watch("hasChild");

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
    
    if (watchQuestionType !== 'SUBJECTIVE' && newErrors.evaluationRubric) {
      delete newErrors.evaluationRubric;
    }
    
    if (watchQuestionType !== 'MATCHING' && newErrors.matchingDetails) {
      delete newErrors.matchingDetails;
    }
    
    if (watchQuestionType !== 'PASSAGE' && newErrors.passageDetails) {
      delete newErrors.passageDetails;
    }
    
    if (watchQuestionType !== 'SINGLE_CORRECT_MCQ' && watchQuestionType !== 'MULTIPLE_CORRECT_MCQ' && newErrors.options) {
      delete newErrors.options;
    }
    
    setValidationErrors(newErrors);
  }, [watchQuestionType]);

  // Clean up year validation error when source changes
  useEffect(() => {
    if (watchSource !== 'PREVIOUS_YEAR' && validationErrors.year) {
      const newErrors = { ...validationErrors };
      delete newErrors.year;
      setValidationErrors(newErrors);
    }
  }, [watchSource, validationErrors]);

  // Reset errors when hasChild changes
  useEffect(() => {
    if (watchHasChild) {
      // For parent questions, we only need id, source and source-dependent fields
      setValidationErrors({});
    }
  }, [watchHasChild]);

  // Update hasChild when questionMode changes
  useEffect(() => {
    form.setValue("hasChild", questionMode === "parent-child");
  }, [questionMode, form]);

  const handleAddChildQuestion = async () => {
    // Validate child question
    const childData = form.getValues();
    const errors = validateFormData(childData);
    
    setValidationErrors(errors);
    
    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors);
      toast.error("Please fix the form errors before adding child question");
      return;
    }
    
    // Add child question to the list
    setChildQuestions([...childQuestions, childData]);
    toast.success("Child question added");
    
    // Reset form for next child question
    resetFormForChildQuestion();
  };
  
  const handleCreateParent = async () => {
    // Validate parent question
    const parentData = form.getValues();
    
    const errors = validateFormData(parentData);
    
    setValidationErrors(errors);
    
    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors);
      toast.error("Please fix the form errors before creating parent");
      return;
    }
    
    setIsLoading(true);
    try {
      // Create parent question
      console.log("Creating parent question:", parentData);
      await api.createQuestion({
        id: parentData.id,
        parentId: null,
        hasChild: true,
        source: parentData.source,
        year: parentData.year,
        createdBy: parentData.createdBy
      });
      
      toast.success("Parent question created");
      setIsParentCreated(true);
      setParentQuestion(parentData);
      setMode("child");
      
      // Reset form to prepare for child questions
      resetFormForChildQuestion();
    } catch (error) {
      console.error("Failed to create parent question:", error);
      toast.error("Failed to create parent question");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmitAllChildQuestions = async () => {
    setIsLoading(true);
    try {
      // Submit all child questions
      for (const childQuestion of childQuestions) {
        await api.createQuestion({
          ...childQuestion,
          parentId: parentQuestion?.id
        });
      }
      
      toast.success(`${childQuestions.length} child questions created successfully`);
      
      // Update parent question with child IDs
      if (parentQuestion) {
        await api.createQuestion({
          id: parentQuestion.id,
          childIds: childQuestions.map(q => q.id),
          hasChild: true,
          source: parentQuestion.source,
          year: parentQuestion.year,
          createdBy: parentQuestion.createdBy
        });
      }
      
      // Reset form completely
      resetEntireForm();
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    } catch (error) {
      console.error("Failed to submit child questions:", error);
      toast.error("Failed to submit child questions");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted with data:", data);
    
    // Custom validation
    const errors = validateFormData(data);
    
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
      source: data.source,
      createdBy: data.createdBy,
    };

    // Add fields only if this is not a parent question
    if (!data.hasChild) {
      questionPayload = {
        ...questionPayload,
        questionTitle: data.questionTitle,
        markupQuestionTitle: data.markupQuestionTitle || data.questionTitle,
        marks: data.marks,
        difficulty: data.difficulty,
        questionType: [data.questionType], // API expects array
        syllabusMapping: data.syllabusMapping,
      };

      // Add question type specific fields
      if ((data.questionType === "MULTIPLE_CORRECT_MCQ" || data.questionType === "SINGLE_CORRECT_MCQ") && data.options) {
        questionPayload.options = data.options;
      } else if (data.questionType === "SUBJECTIVE" && data.evaluationRubric) {
        questionPayload.evaluationRubric = data.evaluationRubric;
      } else if (data.questionType === "PASSAGE" && data.passageDetails) {
        questionPayload.passageDetails = data.passageDetails;
      } else if (data.questionType === "MATCHING" && data.matchingDetails) {
        questionPayload.matchingDetails = {
          leftColumn: data.matchingDetails.leftColumn.filter(item => item.trim() !== '') || [],
          rightColumn: data.matchingDetails.rightColumn.filter(item => item.trim() !== '') || [],
          correctMatches: data.matchingDetails.correctMatches || []
        };
      }
    }
    
    // Add year field only if it's a previous year question
    if (data.source === "PREVIOUS_YEAR") {
      questionPayload.year = data.year;
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Question</CardTitle>
        <CardDescription>
          Choose the type of question you want to create
        </CardDescription>
        <div className="flex items-center space-x-4 pt-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="mode-switch" 
              checked={questionMode === "parent-child"}
              onCheckedChange={(checked) => handleModeChange(checked ? "parent-child" : "standard")}
            />
            <label htmlFor="mode-switch" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {questionMode === "parent-child" ? "Parent-Child Question Mode" : "Standard Question Mode"}
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Standard Question Mode */}
            {questionMode === "standard" && (
              <>
                <QuestionBasicInfo 
                  form={form} 
                  watchSource={watchSource}
                  watchHasChild={false} // Force hasChild=false for standard mode
                  availableQuestions={availableQuestions as Question[]}
                  errors={validationErrors}
                />
                
                {/* Question Type Specific Fields */}
                {(watchQuestionType === "SINGLE_CORRECT_MCQ" || watchQuestionType === "MULTIPLE_CORRECT_MCQ") && (
                  <OptionBasedQuestion 
                    form={form} 
                    errors={validationErrors}
                  />
                )}

                {watchQuestionType === "SUBJECTIVE" && (
                  <SubjectiveQuestion 
                    form={form} 
                    errors={validationErrors}
                  />
                )}

                {watchQuestionType === "PASSAGE" && (
                  <PassageQuestion 
                    form={form} 
                    errors={validationErrors}
                  />
                )}

                {watchQuestionType === "MATCHING" && (
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
                
                <div className="flex justify-end mt-6">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                  >
                    Create Question
                  </Button>
                </div>
              </>
            )}
            
            {/* Parent-Child Question Mode */}
            {questionMode === "parent-child" && (
              <>
                {/* Parent question creation mode */}
                {mode === "parent" && (
                  <>
                    <QuestionBasicInfo 
                      form={form} 
                      watchSource={watchSource}
                      watchHasChild={true} // Force hasChild=true for parent creation
                      availableQuestions={availableQuestions as Question[]}
                      errors={validationErrors}
                    />
                    
                    <div className="flex justify-end mt-6">
                      <Button 
                        type="button" 
                        onClick={handleCreateParent} 
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        Create Parent Question
                      </Button>
                    </div>
                  </>
                )}
                
                {/* Child question creation mode */}
                {mode === "child" && (
                  <>
                    <div className="bg-slate-100 p-4 rounded-md mb-6">
                      <h3 className="font-medium">Parent Question Information</h3>
                      <p className="text-sm text-slate-600">ID: {parentQuestion?.id}</p>
                      <p className="text-sm text-slate-600">Source: {parentQuestion?.source}</p>
                      {parentQuestion?.source === "PREVIOUS_YEAR" && (
                        <p className="text-sm text-slate-600">Year: {parentQuestion?.year}</p>
                      )}
                      <p className="text-sm text-slate-600">Child Questions: {childQuestions.length}</p>
                    </div>
                    
                    <QuestionBasicInfo 
                      form={form} 
                      watchSource={watchSource}
                      watchHasChild={false}
                      availableQuestions={availableQuestions as Question[]}
                      errors={validationErrors}
                      isChildQuestion={true}
                    />
                    
                    {/* Question Type Specific Fields */}
                    {(watchQuestionType === "SINGLE_CORRECT_MCQ" || watchQuestionType === "MULTIPLE_CORRECT_MCQ") && (
                      <OptionBasedQuestion 
                        form={form} 
                        errors={validationErrors}
                      />
                    )}

                    {watchQuestionType === "SUBJECTIVE" && (
                      <SubjectiveQuestion 
                        form={form} 
                        errors={validationErrors}
                      />
                    )}

                    {watchQuestionType === "PASSAGE" && (
                      <PassageQuestion 
                        form={form} 
                        errors={validationErrors}
                      />
                    )}

                    {watchQuestionType === "MATCHING" && (
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
                    
                    {/* Child Questions List */}
                    {childQuestions.length > 0 && (
                      <div className="bg-slate-100 p-4 rounded-md">
                        <h3 className="font-medium mb-2">Added Child Questions</h3>
                        <ul className="space-y-2 max-h-[200px] overflow-y-auto">
                          {childQuestions.map((question, index) => (
                            <li key={index} className="bg-white p-2 rounded border">
                              <p className="font-medium">ID: {question.id}</p>
                              <p className="text-sm text-slate-600 line-clamp-2">
                                {question.questionTitle}
                              </p>
                              <p className="text-xs text-slate-500">Type: {question.questionType}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-4 justify-end">
                      <Button 
                        type="button" 
                        onClick={handleAddChildQuestion} 
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Add Child Question
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={resetFormForChildQuestion} 
                        disabled={isLoading}
                      >
                        Reset Child Form
                      </Button>
                      
                      <Button 
                        type="button" 
                        onClick={handleSubmitAllChildQuestions} 
                        disabled={isLoading || childQuestions.length === 0}
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                      >
                        <Check size={18} />
                        Submit All Child Questions
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
