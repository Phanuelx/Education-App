// src/components/teacher/ScheduleForm.jsx
import { useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ScheduleForm({ open, onOpenChange, onScheduleCreated, courses, selectedDate }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    title: "",
    description: "",
    courseId: "",
    date: format(selectedDate, "yyyy-MM-dd"),
    startTime: "10:00",
    endTime: "11:30",
    meetingLink: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleData({ ...scheduleData, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setScheduleData({ ...scheduleData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // This would normally send a request to your API
      // For now, we'll simulate adding a schedule
      setTimeout(() => {
        const selectedCourse = courses.find(course => course.id.toString() === scheduleData.courseId);
        
        const newSchedule = {
          title: scheduleData.title,
          description: scheduleData.description,
          course: selectedCourse,
          startTime: `${scheduleData.date}T${scheduleData.startTime}:00`,
          endTime: `${scheduleData.date}T${scheduleData.endTime}:00`,
          meetingLink: scheduleData.meetingLink,
          teacher: user.id,
          createdAt: new Date().toISOString(),
        };
        
        onScheduleCreated(newSchedule);
        onOpenChange(false);
        setIsLoading(false);
        
        // Reset form
        setScheduleData({
          title: "",
          description: "",
          courseId: "",
          date: format(new Date(), "yyyy-MM-dd"),
          startTime: "10:00",
          endTime: "11:30",
          meetingLink: "",
        });
      }, 1000);
    } catch (error) {
      console.error("Error creating schedule:", error);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Schedule a Class</DialogTitle>
          <DialogDescription>
            Fill in the details to schedule a new class session for your course.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="courseId">Course</Label>
              <Select
                value={scheduleData.courseId}
                onValueChange={(value) => handleSelectChange("courseId", value)}
                required
              >
                <SelectTrigger id="courseId">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="title">Class Title</Label>
              <Input
                id="title"
                name="title"
                value={scheduleData.title}
                onChange={handleInputChange}
                placeholder="e.g. Introduction to React Hooks"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={scheduleData.description}
                onChange={handleInputChange}
                placeholder="Briefly describe what will be covered in this class"
                required
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={scheduleData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={scheduleData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={scheduleData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                name="meetingLink"
                value={scheduleData.meetingLink}
                onChange={handleInputChange}
                placeholder="e.g. https://meet.example.com/class"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Scheduling..." : "Schedule Class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}