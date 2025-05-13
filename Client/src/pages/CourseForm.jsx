// src/pages/CourseForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { courseAPI } from "@/services/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Plus, Save } from "lucide-react";

export default function CourseForm() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    publicationStatus: "DRAFT"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error("Course title is required");
      return;
    }
    
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }
    
    if (!formData.level) {
      toast.error("Please select a difficulty level");
      return;
    }
    
    try {
      setLoading(true);
      
      const courseData = {
        ...formData,
        // If we want to link the course to a teacher in the future
        // teacher: currentUser._id
      };
      
      const response = await courseAPI.create(courseData);
      
      if (response.data.success) {
        toast.success("Course created successfully!");
        
        // Redirect based on user role
        if (currentUser.role === "ADMIN") {
          navigate("/admin/courses");
        } else {
          navigate("/teacher");
        }
      }
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error(error.response?.data?.msg || "Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: "PROGRAMMING", label: "Programming" },
    { value: "SCIENCE", label: "Science" },
    { value: "MATH", label: "Math" },
    { value: "ART", label: "Art" },
    { value: "BUSINESS", label: "Business" },
  ];

  const levelOptions = [
    { value: "BEGINNER", label: "Beginner" },
    { value: "INTERMEDIATE", label: "Intermediate" },
    { value: "ADVANCED", label: "Advanced" },
  ];

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-4" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Course</h1>
          <p className="text-muted-foreground">
            Add a new course to your teaching curriculum
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>
                Enter the basic information about your course
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Introduction to React"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Course Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe what students will learn in this course"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange("category", value)}
                      required
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="level">Difficulty Level <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => handleSelectChange("level", value)}
                      required
                    >
                      <SelectTrigger id="level">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {levelOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Publication Status</Label>
                  <RadioGroup
                    defaultValue="DRAFT"
                    value={formData.publicationStatus}
                    onValueChange={(value) => handleSelectChange("publicationStatus", value)}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="DRAFT" id="draft" />
                      <Label htmlFor="draft" className="font-normal cursor-pointer">
                        Draft - Save as a draft (not visible to students)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="PUBLISHED" id="published" />
                      <Label htmlFor="published" className="font-normal cursor-pointer">
                        Published - Make course available for enrollment
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ARCHIVED" id="archived" />
                      <Label htmlFor="archived" className="font-normal cursor-pointer">
                        Archived - Hide from course listings
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t p-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Create Course
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Course Creation Guide</CardTitle>
              <CardDescription>
                Tips for creating an effective course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Course Title</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a clear, specific title that accurately describes what students will learn.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Course Description</h3>
                <p className="text-sm text-muted-foreground">
                  Write a compelling description that outlines the learning objectives, target audience, and key topics covered.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Category & Level</h3>
                <p className="text-sm text-muted-foreground">
                  Select the most relevant category and appropriate difficulty level to help students find your course.
                </p>
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Next Steps</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      After creating your course, you'll be able to add class sessions and manage student enrollments.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you need assistance with course creation, check out our <a href="#" className="text-primary hover:underline">teacher resources</a> or contact the admin team.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}