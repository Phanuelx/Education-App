// src/components/teacher/CourseForm.jsx
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { courseAPI } from "@/services/api";

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

export default function CourseForm({ open, onOpenChange, onCourseCreated }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    level: "Beginner",
    status: "Draft",
    imageUrl: "https://via.placeholder.com/300x200?text=Course",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setCourseData({ ...courseData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    
    try {
      // Add teacher ID to course data
      const courseDataWithTeacher = {
        ...courseData,
        teacher: user.id
      };
      
      const response = await courseAPI.createCourse(courseDataWithTeacher);
      onCourseCreated(response.data.data);
      onOpenChange(false);
      
      // Reset form
      setCourseData({
        title: "",
        description: "",
        category: "",
        level: "Beginner",
        status: "Draft",
        imageUrl: "https://via.placeholder.com/300x200?text=Course",
      });
    } catch (error) {
      console.error("Error creating course:", error);
      // You could add error handling UI here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new course. You can save it as a draft or publish it immediately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {/* Form fields would go here */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}