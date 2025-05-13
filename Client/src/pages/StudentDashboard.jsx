// src/pages/StudentDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { enrollmentAPI, classAPI } from "@/services/api";
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns";

// Import UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, BookOpen, Clock, GraduationCap, Calendar, AlertCircle, CheckCircle, X } from "lucide-react";

// Custom toast component
const CustomToast = ({ title, message, type, onClose }) => {
  const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  const Icon = type === "success" ? CheckCircle : AlertCircle;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md border-l-4 ${bgColor} border-${type === "success" ? "green" : "red"}-500 max-w-md flex items-start justify-between animate-in slide-in-from-top-3`}>
      <div className="flex gap-3">
        <Icon className={`h-5 w-5 ${type === "success" ? "text-green-500" : "text-red-500"}`} />
        <div>
          {title && <h3 className={`font-semibold ${textColor}`}>{title}</h3>}
          {message && <p className={`text-sm ${textColor}`}>{message}</p>}
        </div>
      </div>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Custom toast state
  const [toast, setToast] = useState(null);
  
  const showToast = useCallback((title, message, type = "success") => {
    setToast({ title, message, type });
    
    // Auto dismiss toast after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);
  
  useEffect(() => {
    if (currentUser && currentUser._id) {
      fetchStudentData();
    }
  }, [currentUser]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Fetch enrollments
      const enrollmentResponse = await enrollmentAPI.getByStudent(currentUser._id);
      
      if (enrollmentResponse.data.success) {
        const enrollmentData = enrollmentResponse.data.enrollments;
        setEnrollments(enrollmentData);
        
        // Get course IDs from enrollments
        const courseIds = enrollmentData.map(enrollment => 
          enrollment.course?._id || enrollment.course
        ).filter(id => id); // Filter out any null/undefined IDs
        
        // Fetch upcoming classes for the enrolled courses
        if (courseIds.length > 0) {
          try {
            const classesResponse = await classAPI.getAll();
            
            if (classesResponse.data.success) {
              const allClasses = classesResponse.data.classes;
              
              // Filter classes to only include those for enrolled courses and upcoming
              const now = new Date();
              const nextTwoWeeks = addDays(now, 14); // Extending to two weeks for better visibility
              
              const filteredClasses = allClasses.filter(cls => {
                // Skip classes with null/undefined course
                if (!cls.course) {
                  console.log("Skipping class due to null course:", cls.title);
                  return false;
                }

                const classDate = parseISO(cls.scheduledDateTime);
                
                // Safely extract course ID with null checks
                const courseId = cls.course && (typeof cls.course === 'object' ? cls.course._id : cls.course);
                
                // Skip if courseId couldn't be determined
                if (!courseId) {
                  console.log("Skipping class due to invalid course ID:", cls.title);
                  return false;
                }
                
                // Check if the course ID is in enrolled courses
                const courseMatches = courseIds.includes(courseId);
                
                // Check if the class is in the future and within the next 14 days
                const isUpcoming = isAfter(classDate, now) && isBefore(classDate, nextTwoWeeks);
                
                // For debugging
                if (!courseMatches) {
                  console.log("Class not showing because student not enrolled in course:", cls.title, courseId);
                }
                
                if (courseMatches && !isUpcoming) {
                  console.log("Class not showing because date is outside range:", cls.title, format(classDate, "yyyy-MM-dd HH:mm"));
                }
                
                return courseMatches && isUpcoming;
              });
              
              // Sort by date (closest first)
              filteredClasses.sort((a, b) => {
                return parseISO(a.scheduledDateTime) - parseISO(b.scheduledDateTime);
              });
              
              setUpcomingClasses(filteredClasses);
            }
          } catch (error) {
            console.error("Error fetching classes:", error);
            showToast("Error", "Failed to load your class schedule", "error");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      showToast("Error", "Failed to load your courses. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Calculate completion stats
  const completedEnrollments = enrollments.filter(
    enrollment => enrollment.status === "COMPLETED"
  ).length;
  
  const enrollmentStats = {
    total: enrollments.length,
    completed: completedEnrollments,
    inProgress: enrollments.length - completedEnrollments,
    completionRate: enrollments.length > 0 
      ? Math.round((completedEnrollments / enrollments.length) * 100) 
      : 0
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Custom Toast */}
      {toast && (
        <CustomToast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {currentUser?.username || "Student"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchStudentData} variant="outline" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M21 2v6h-6"></path>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
              <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
            </svg>
            Refresh
          </Button>
          <Button asChild>
            <Link to="/courses">
              Browse Courses
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="my-courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            My Courses
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming Classes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4">Loading your information...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Courses
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{enrollmentStats.total}</div>
                    <p className="text-xs text-muted-foreground">
                      Courses you've enrolled in
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Courses Completed
                    </CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{enrollmentStats.completed}</div>
                    <p className="text-xs text-muted-foreground">
                      Courses you've successfully completed
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Upcoming Classes
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{upcomingClasses.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Classes scheduled in the next 14 days
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Your Learning Progress</CardTitle>
                  <CardDescription>Track your overall course completion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span>Course Completion Rate</span>
                      </div>
                      <span className="font-medium">{enrollmentStats.completionRate}%</span>
                    </div>
                    <Progress value={enrollmentStats.completionRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              
              {upcomingClasses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Next Upcoming Class</CardTitle>
                    <CardDescription>Your next scheduled class session</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {upcomingClasses[0] && (
                      <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold text-lg">{upcomingClasses[0].title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{upcomingClasses[0].description}</p>
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{format(parseISO(upcomingClasses[0].scheduledDateTime), "EEEE, MMMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>{format(parseISO(upcomingClasses[0].scheduledDateTime), "h:mm a")} ({upcomingClasses[0].duration} minutes)</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/student/schedule">View All Classes</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="my-courses">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4">Loading your courses...</p>
            </div>
          ) : enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.map((enrollment) => {
                const course = enrollment.course || {};
                
                return (
                  <Card key={enrollment._id || index} className="overflow-hidden flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{course.title || "Untitled Course"}</CardTitle>
                          <CardDescription className="mt-2">
                            {course.description?.substring(0, 100)}{course.description?.length > 100 ? '...' : ''}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {course.category && <Badge>{course.category}</Badge>}
                        {course.level && <Badge variant="outline">{course.level}</Badge>}
                        <Badge variant={enrollment.status === "COMPLETED" ? "default" : "secondary"}>
                          {enrollment.status || "IN_PROGRESS"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3" />
                          <span>Enrolled: {enrollment.enrollmentDate ? format(parseISO(enrollment.enrollmentDate), "MMMM d, yyyy") : "Unknown"}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/50 p-4">
                      <Button asChild className="w-full">
                        <Link to={`/student/courses/${course._id || "#"}`}>
                          {enrollment.status === "COMPLETED" ? "Review Course" : "Continue Learning"}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Courses Found</CardTitle>
                <CardDescription>You haven't enrolled in any courses yet.</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="mb-4">Start your learning journey by enrolling in courses.</p>
                <Button asChild>
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedule">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4">Loading your schedule...</p>
            </div>
          ) : upcomingClasses.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Classes</CardTitle>
                <CardDescription>Classes scheduled in the next 14 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingClasses.map((classItem) => (
                    <div key={classItem._id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
                      <div className="md:w-1/4">
                        <div className="text-lg font-semibold">{format(parseISO(classItem.scheduledDateTime), "EEEE")}</div>
                        <div className="text-2xl font-bold">{format(parseISO(classItem.scheduledDateTime), "MMMM d")}</div>
                        <div className="text-muted-foreground">{format(parseISO(classItem.scheduledDateTime), "h:mm a")}</div>
                      </div>
                      <div className="md:w-3/4">
                        <h3 className="text-lg font-semibold">{classItem.title}</h3>
                        <p className="text-muted-foreground mb-2">{classItem.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {classItem.duration} minutes
                          </Badge>
                          {classItem.meetingLink && (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                              <a href={classItem.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" /> Join Meeting
                              </a>
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Upcoming Classes</CardTitle>
                <CardDescription>You don't have any classes scheduled in the next 14 days.</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p>Check back later for upcoming class sessions.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}