// src/pages/CourseListing.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { courseAPI, enrollmentAPI } from "@/services/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, BookOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";

export default function CourseListing() {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

  useEffect(() => {
    fetchCourses();
    if (isAuthenticated && currentUser) {
      fetchEnrollments();
    }
  }, [isAuthenticated, currentUser]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getAll();
      if (response.data.success) {
        // Filter only published courses
        const publishedCourses = response.data.courses.filter(
          course => course.publicationStatus === "PUBLISHED"
        );
        setCourses(publishedCourses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentAPI.getByStudent(currentUser._id);
      if (response.data.success) {
        setEnrollments(response.data.enrollments);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enroll in courses",
        variant: "default",
      });
      navigate("/login");
      return;
    }

    try {
      setEnrollingCourseId(courseId);
      const enrollmentData = {
        course: courseId,
        user: currentUser._id,
      };

      const response = await enrollmentAPI.create(enrollmentData);
      
      if (response.data.success) {
        toast({
          title: "Success!",
          description: "You have successfully enrolled in this course",
          variant: "default",
        });
        fetchEnrollments();
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast({
        title: "Enrollment Failed",
        description: error.response?.data?.message || "Failed to enroll in this course",
        variant: "destructive",
      });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const isEnrolled = (courseId) => {
    return enrollments.some(enrollment => 
      enrollment.course._id === courseId || enrollment.course === courseId
    );
  };

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || !categoryFilter ? true : course.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || !levelFilter ? true : course.level === levelFilter;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Get category badge color
  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case "PROGRAMMING": return "bg-purple-100 text-purple-800";
      case "SCIENCE": return "bg-blue-100 text-blue-800";
      case "MATH": return "bg-green-100 text-green-800";
      case "ART": return "bg-pink-100 text-pink-800";
      case "BUSINESS": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Available Courses</h1>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="PROGRAMMING">Programming</SelectItem>
            <SelectItem value="SCIENCE">Science</SelectItem>
            <SelectItem value="MATH">Math</SelectItem>
            <SelectItem value="ART">Art</SelectItem>
            <SelectItem value="BUSINESS">Business</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="BEGINNER">Beginner</SelectItem>
            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
            <SelectItem value="ADVANCED">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4">Loading courses...</p>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course._id} className="overflow-hidden h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    <CardDescription className="mt-2">{course.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getCategoryBadgeColor(course.category)}>
                    {course.category}
                  </Badge>
                  <Badge variant="outline">
                    {course.level}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-gray-50 p-4">
                {isEnrolled(course._id) ? (
                  <Button variant="secondary" className="w-full" onClick={() => navigate(`/student/courses/${course._id}`)}>
                    Continue Learning
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => handleEnroll(course._id)}
                    disabled={enrollingCourseId === course._id}
                  >
                    {enrollingCourseId === course._id ? "Enrolling..." : "Enroll Now"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium">No courses found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}