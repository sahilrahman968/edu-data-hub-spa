
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import * as api from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

// Define interfaces for our data types
interface Board {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Chapter {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
}

interface Question {
  id: string;
  questionTitle?: string;
}

const questionTypeSchema = z.enum(["option_based", "subjective", "passage", "matching"]);

const optionSchema = z.object({
  id: z.string().min(1, { message: "Option ID is required" }),
  text: z.string().min(1, { message: "Option text is required" }),
  isCorrect: z.boolean().default(false),
});

const evaluationRubricSchema = z.object({
  criterion: z.string().min(1, { message: "Criterion is required" }),
  weight: z.number().min(1, { message: "Weight must be at least 1" }),
  keywordHints: z.array(z.string()).optional(),
});

const matchingSchema = z.object({
  leftColumn: z.array(z.string().min(1, { message: "Left column item is required" })),
  rightColumn: z.array(z.string().min(1, { message: "Right column item is required" })),
  correctMatches: z.array(z.object({
    from: z.string().min(1, { message: "From value is required" }),
    to: z.string().min(1, { message: "To value is required" }),
  })),
});

const formSchema = z.object({
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
});

type FormData = z.infer<typeof formSchema>;

export default function QuestionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);

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
    resolver: zodResolver(formSchema),
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
  });

  const watchQuestionType = form.watch("questionType");

  // Fetch boards
  const { data: boards = [] } = useQuery({
    queryKey: ['boards'],
    queryFn: api.getBoards,
    enabled: isAuthenticated,
  });

  // Fetch classes based on selected board
  const { data: classes = [] } = useQuery({
    queryKey: ['classes', selectedBoardId],
    queryFn: () => api.getClasses(selectedBoardId),
    enabled: !!selectedBoardId && isAuthenticated,
  });

  // Fetch subjects based on selected class
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', selectedClassId],
    queryFn: () => api.getSubjects(selectedClassId),
    enabled: !!selectedClassId && isAuthenticated,
  });

  // Fetch chapters based on selected subject
  const { data: chapters = [] } = useQuery({
    queryKey: ['chapters', selectedSubjectId],
    queryFn: () => api.getChapters(selectedSubjectId),
    enabled: !!selectedSubjectId && isAuthenticated,
  });

  // Fetch topics based on selected chapters
  const { data: topics = [] } = useQuery({
    queryKey: ['topics', selectedChapters],
    queryFn: () => api.getTopics(selectedChapters[0]),
    enabled: selectedChapters.length > 0 && isAuthenticated,
  });

  // Fetch available non-parent questions for childIds
  const { data: availableQuestions = [] } = useQuery({
    queryKey: ['questions', 'non-parents'],
    queryFn: () => api.getQuestions(), 
    enabled: isAuthenticated,
  });

  // Set up field arrays for repeatable fields
  const optionsArray = useFieldArray({
    control: form.control,
    name: "options",
  });

  const evaluationRubricArray = useFieldArray({
    control: form.control,
    name: "evaluationRubric",
  });

  const chaptersArray = useFieldArray({
    control: form.control,
    name: "syllabusMapping.chapter",
  });

  const topicsArray = useFieldArray({
    control: form.control,
    name: "syllabusMapping.topic",
  });

  const correctMatchesArray = useFieldArray({
    control: form.control,
    name: "matchingDetails.correctMatches",
  });

  // Define left and right column arrays as regular state instead of field arrays
  const [leftColumnItems, setLeftColumnItems] = useState<string[]>(['']);
  const [rightColumnItems, setRightColumnItems] = useState<string[]>(['']);

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

  // Handle board selection
  const handleBoardChange = (boardId: string) => {
    // Add type assertion to specify that items in boards array conform to the Board interface
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

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted with data:", data);
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
      year: data.year || "",
      source: data.source,
      createdBy: data.createdBy,
      syllabusMapping: data.syllabusMapping,
    };

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
        leftColumn: leftColumnItems.filter(item => item.trim() !== ''),
        rightColumn: rightColumnItems.filter(item => item.trim() !== ''),
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
        <CardDescription>Add a new educational question to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Question Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Question ID */}
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question ID*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter unique question ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Parent Question ID */}
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Question ID</FormLabel>
                      <Select
                        value={field.value || "none"}
                        onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent question (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {(availableQuestions as Question[]).map((question: Question) => (
                            <SelectItem key={question.id} value={question.id}>
                              {question.id} - {question.questionTitle?.substring(0, 30)}...
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Has Child */}
                <FormField
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Marks */}
                <FormField
                  control={form.control}
                  name="marks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marks*</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Difficulty */}
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty*</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Question Type */}
                <FormField
                  control={form.control}
                  name="questionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Type*</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="option_based">Multiple Choice</SelectItem>
                          <SelectItem value="subjective">Subjective</SelectItem>
                          <SelectItem value="passage">Passage</SelectItem>
                          <SelectItem value="matching">Matching</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Source */}
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source*</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="previous_year">Previous Year</SelectItem>
                          <SelectItem value="ai_generated">AI Generated</SelectItem>
                          <SelectItem value="user_generated">User Generated</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Year (optional) */}
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter year (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Question Title */}
              <FormField
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Markup Question Title (optional) */}
              <FormField
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Question Type Specific Fields */}
            {watchQuestionType === "option_based" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Options</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => optionsArray.append({ id: String(optionsArray.fields.length + 1), text: "", isCorrect: false })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Option
                  </Button>
                </div>

                {optionsArray.fields.map((field, index) => (
                  <div key={field.id} className="flex items-start space-x-2">
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-1">
                          <FormField
                            control={form.control}
                            name={`options.${index}.id`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Option ID</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="md:col-span-3">
                          <FormField
                            control={form.control}
                            name={`options.${index}.text`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Option Text</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="md:col-span-1">
                          <FormField
                            control={form.control}
                            name={`options.${index}.isCorrect`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-end space-x-3 h-full pb-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Correct</FormLabel>
                                <FormMessage />
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
                      onClick={() => optionsArray.remove(index)}
                      className="mt-6"
                      disabled={optionsArray.fields.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {watchQuestionType === "subjective" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Evaluation Rubric</h3>
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
                          <FormField
                            control={form.control}
                            name={`evaluationRubric.${index}.criterion`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Criterion</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="md:col-span-1">
                          <FormField
                            control={form.control}
                            name={`evaluationRubric.${index}.weight`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Weight</FormLabel>
                                <FormControl>
                                  <Input type="number" min="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                                </FormControl>
                                <FormMessage />
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
            )}

            {watchQuestionType === "passage" && (
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
            )}

            {watchQuestionType === "matching" && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Left Column Items</h3>
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
                    <h3 className="text-lg font-medium">Right Column Items</h3>
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
                    <h3 className="text-lg font-medium">Correct Matches</h3>
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
                              <FormLabel>From</FormLabel>
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
                              <FormLabel>To</FormLabel>
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
            )}

            {/* Syllabus Mapping Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Syllabus Mapping</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Board */}
                <FormField
                  control={form.control}
                  name="syllabusMapping.board.id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Board*</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => handleBoardChange(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select board" />
                        </SelectTrigger>
                        <SelectContent>
                          {(boards as Board[]).map((board: Board) => (
                            <SelectItem key={board.id} value={board.id}>{board.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Class */}
                <FormField
                  control={form.control}
                  name="syllabusMapping.class.id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class*</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => handleClassChange(value)}
                        disabled={!selectedBoardId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {(classes as Class[]).map((cls: Class) => (
                            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subject */}
                <FormField
                  control={form.control}
                  name="syllabusMapping.subject.id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject*</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => handleSubjectChange(value)}
                        disabled={!selectedClassId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {(subjects as Subject[]).map((subject: Subject) => (
                            <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Chapters */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Chapters*</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => chaptersArray.append({ id: "", name: "" })}
                    disabled={!selectedSubjectId}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Chapter
                  </Button>
                </div>
                {chaptersArray.fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 mb-2">
                    <FormField
                      control={form.control}
                      name={`syllabusMapping.chapter.${index}.id`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Select
                            value={field.value}
                            onValueChange={(value) => handleChapterChange(index, value)}
                            disabled={!selectedSubjectId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select chapter" />
                            </SelectTrigger>
                            <SelectContent>
                              {(chapters as Chapter[]).map((chapter: Chapter) => (
                                <SelectItem key={chapter.id} value={chapter.id}>{chapter.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => chaptersArray.remove(index)}
                      disabled={chaptersArray.fields.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Topics (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Topics (Optional)</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => topicsArray.append({ id: "", name: "" })}
                    disabled={selectedChapters.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Topic
                  </Button>
                </div>
                {topicsArray.fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 mb-2">
                    <FormField
                      control={form.control}
                      name={`syllabusMapping.topic.${index}.id`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Select
                            value={field.value}
                            onValueChange={(value) => handleTopicChange(index, value)}
                            disabled={selectedChapters.length === 0}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select topic" />
                            </SelectTrigger>
                            <SelectContent>
                              {(topics as Topic[]).map((topic: Topic) => (
                                <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => topicsArray.remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating..." : "Create Question"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
