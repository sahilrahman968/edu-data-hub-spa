import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { FormData, Board, Class, Subject, Chapter, Topic, ValidationErrors } from "./types";
import { Plus, Trash2 } from "lucide-react";

interface SyllabusMappingProps {
  form: UseFormReturn<FormData>;
  boards: Board[];
  classes: Class[];
  subjects: Subject[];
  chapters: Chapter[];
  topics: Topic[];
  selectedBoardId: string;
  selectedClassId: string;
  selectedSubjectId: string;
  selectedChapters: string[];
  handleBoardChange: (boardId: string) => void;
  handleClassChange: (classId: string) => void;
  handleSubjectChange: (subjectId: string) => void;
  handleChapterChange: (index: number, chapterId: string) => void;
  handleTopicChange: (index: number, topicId: string) => void;
  errors: ValidationErrors;
}

export default function SyllabusMapping({ 
  form, 
  boards, 
  classes, 
  subjects, 
  chapters, 
  topics,
  selectedBoardId,
  selectedClassId,
  selectedSubjectId,
  selectedChapters,
  handleBoardChange,
  handleClassChange,
  handleSubjectChange,
  handleChapterChange,
  handleTopicChange,
  errors
}: SyllabusMappingProps) {
  
  const chaptersArray = useFieldArray({
    control: form.control,
    name: "syllabusMapping.chapter",
  });

  const topicsArray = useFieldArray({
    control: form.control,
    name: "syllabusMapping.topic",
  });

  return (
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
                  {boards.map((board) => (
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
                  {classes.map((cls) => (
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
                  {subjects.map((subject) => (
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
                      {chapters.map((chapter) => (
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
                      {topics.map((topic) => (
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
  );
}
