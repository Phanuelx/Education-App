// src/pages/CourseDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { courseAPI, enrollmentAPI } from "@/services/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Calendar, Users } from "lucide-react";
import { toast } from "sonner";

export default function CourseDetailPage() {
  const { id } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && currentUser && course) {
      checkEnrollmentStatus();
    }
  }, [isAuthenticated, currentUser, course]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getById(id);
      
      if (response.data.success) {
        setCourse(response.data.course);
      } else {
        toast.error("Failed to load course details");
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
      toast.error("Error loading course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      if (currentUser.role !== "STUDENT") return;
      
      const response = await enrollmentAPI.getByStudent(currentUser._id);
      
      if (response.data.success) {
        const enrollments = response.data.enrollments;
        const enrolled = enrollments.some(enrollment => 
          enrollment.course._id === id || enrollment.course === id
        );
        setIsEnrolled(enrolled);
      }
    } catch (error) {
      console.error("Error checking enrollment:", error);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to enroll in this course");
      navigate("/login");
      return;
    }

    try {
      setEnrolling(true);
      
      // Check if user is a student
      if (currentUser.role !== "STUDENT") {
        toast.error("Only students can enroll in courses");
        setEnrolling(false);
        return;
      }
      
      const enrollmentData = {
        course: id,
        user: currentUser._id,
      };

      console.log("Enrollment data being sent:", enrollmentData); // Debug line
      console.log("Current user:", currentUser); // Debug line
      
      const response = await enrollmentAPI.create(enrollmentData);
      
      if (response.data.success) {
        toast.success("Successfully enrolled in the course!");
        setIsEnrolled(true);
      } else {
        toast.error(response.data.message || "Failed to enroll in course");
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
      
      // More detailed error handling
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          "Error during enrollment. Please try again.";
                          
      toast.error(errorMessage);
    } finally {
      setEnrolling(false);
    }
  };

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-4">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
        <p className="text-gray-500 mb-6">The course you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/courses">Browse Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Course detail implementation */}
      <div className="relative mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-64 rounded-lg flex items-center justify-center">
          <BookOpen className="h-20 w-20 text-white opacity-20" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className={getCategoryBadgeColor(course.category)}>
                {course.category}
              </Badge>
              <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                {course.level}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
            <p className="text-lg md:text-xl opacity-90">{course.description}</p>
          </div>
        </div>
      </div>

      {/* Course actions */}
      <div className="flex justify-end mt-6 mb-12">
        {isAuthenticated ? (
          isEnrolled ? (
            <Button asChild>
              <Link to={`/student/courses/${id}`}>Continue Learning</Link>
            </Button>
          ) : (
            <Button onClick={handleEnroll} disabled={enrolling || currentUser?.role !== "STUDENT"}>
              {enrolling ? "Enrolling..." : "Enroll Now"}
            </Button>
          )
        ) : (
          <Button asChild>
            <Link to="/login">Sign In to Enroll</Link>
          </Button>
        )}
      </div>

      {/* Course details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              {/* Overview content */}
              <h2 className="text-2xl font-bold mb-4">About This Course</h2>
              <p className="text-gray-700 mb-6">{course.description}</p>
              
              <h3 className="text-xl font-semibold mb-3">What You'll Learn</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-green-500">✓</span>
                  <span>Fundamentals and core concepts of the subject</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-green-500">✓</span>
                  <span>Practical skills and techniques applicable in real-world scenarios</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-green-500">✓</span>
                  <span>Advanced strategies to deepen your understanding</span>
                </li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-3">Requirements</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="mr-2 mt-1">•</span>
                  <span>Basic understanding of the subject area</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1">•</span>
                  <span>Willingness to learn and practice</span>
                </li>
              </ul>
            </TabsContent>
            <TabsContent value="curriculum" className="mt-6">
              {/* Curriculum content */}
              <h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">Module 1: Introduction</h3>
                    <p className="text-gray-600 mt-1">Setting the foundation for your learning journey</p>
                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" /> 3 classes • Approximately 2 hours
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">Module 2: Core Concepts</h3>
                    <p className="text-gray-600 mt-1">Understanding the essential elements</p>
                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" /> 4 classes • Approximately 3 hours
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">Module 3: Practical Applications</h3>
                    <p className="text-gray-600 mt-1">Applying your knowledge in real-world scenarios</p>
                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" /> 5 classes • Approximately 4 hours
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="instructor" className="mt-6">
              {/* Instructor content */}
              <h2 className="text-2xl font-bold mb-4">Meet Your Instructor</h2>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="bg-gray-200 rounded-full w-24 h-24 flex items-center justify-center">
                  <Users className="h-12 w-12 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Course Instructor</h3>
                  <p className="text-gray-700 mb-4">
                    An experienced educator with expertise in this field. They bring real-world knowledge and teaching experience to help you master the material.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Course Details</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <div className="text-sm font-medium">Category</div>
                    <div className="text-gray-600">{course.category}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <div className="text-sm font-medium">Level</div>
                    <div className="text-gray-600">{course.level}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <div className="text-sm font-medium">Last Updated</div>
                    <div className="text-gray-600">
                      {new Date(course.dateModified).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-2">Share this course</h4>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}