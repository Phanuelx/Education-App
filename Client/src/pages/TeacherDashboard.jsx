// src/pages/TeacherDashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { courseAPI, classAPI } from "@/services/api";
import { format, parseISO, isToday, isFuture, isPast, addDays } from "date-fns";

// Import UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Users, Calendar, Clock, PlusCircle, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

export default function TeacherDashboard() {
  const { currentUser } = useAuth();
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (currentUser && currentUser._id) {
      fetchTeacherData();
    }
  }, [currentUser]);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      
      // Get teacher's courses
      const coursesResponse = await courseAPI.getAll();
      
      if (coursesResponse.data.success) {
        // In a real application, you would filter by teacher ID
        // For demo, we'll use all courses as if they belong to this teacher
        const courses = coursesResponse.data.courses;
        setTeacherCourses(courses);
        
        // Get course IDs
        const courseIds = courses.map(course => course._id);
        
        // Get classes for these courses
        if (courseIds.length > 0) {
          try {
            const classesResponse = await classAPI.getAll();
            
            if (classesResponse.data.success) {
              // Filter classes by this teacher's courses
              const filteredClasses = classesResponse.data.classes.filter(
                cls => courseIds.includes(cls.course._id || cls.course)
              );
              
              setClasses(filteredClasses);
            }
          } catch (error) {
            console.error("Error fetching classes:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      toast.error("Failed to load your courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get upcoming classes (today and future)
  const upcomingClasses = classes.filter(cls => {
    const classDate = parseISO(cls.scheduledDateTime);
    return isToday(classDate) || isFuture(classDate);
  }).sort((a, b) => parseISO(a.scheduledDateTime) - parseISO(b.scheduledDateTime));

  // Get today's classes
  const todayClasses = classes.filter(cls => {
    const classDate = parseISO(cls.scheduledDateTime);
    return isToday(classDate);
  }).sort((a, b) => parseISO(a.scheduledDateTime) - parseISO(b.scheduledDateTime));

  // Get recently completed classes
  const recentClasses = classes.filter(cls => {
    const classDate = parseISO(cls.scheduledDateTime);
    const twoWeeksAgo = addDays(new Date(), -14);
    return isPast(classDate) && classDate > twoWeeksAgo;
  }).sort((a, b) => parseISO(b.scheduledDateTime) - parseISO(a.scheduledDateTime));

  // Calculate stats
  const stats = {
    totalCourses: teacherCourses.length,
    totalClasses: classes.length,
    upcomingClasses: upcomingClasses.length,
    todayClasses: todayClasses.length
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "SCHEDULED": return "bg-blue-100 text-blue-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {currentUser?.username || "Teacher"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/teacher/schedule">
              <Calendar className="h-4 w-4 mr-2" />
              Manage Schedule
            </Link>
          </Button>
          <Button asChild>
            <Link to="/teacher/courses/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Course
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            My Courses
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Class Schedule
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Courses
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalCourses}</div>
                    <p className="text-xs text-muted-foreground">
                      Courses you are teaching
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Classes
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalClasses}</div>
                    <p className="text-xs text-muted-foreground">
                      Class sessions scheduled
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Today's Classes
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.todayClasses}</div>
                    <p className="text-xs text-muted-foreground">
                      Classes scheduled for today
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
                    <div className="text-2xl font-bold">{stats.upcomingClasses}</div>
                    <p className="text-xs text-muted-foreground">
                      Future classes to be conducted
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {todayClasses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Classes</CardTitle>
                    <CardDescription>Classes scheduled for today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {todayClasses.map((classItem) => (
                        <div key={classItem._id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
                          <div className="md:w-1/4">
                            <div className="text-lg font-semibold">{format(parseISO(classItem.scheduledDateTime), "h:mm a")}</div>
                            <div className="text-muted-foreground">{classItem.duration} minutes</div>
                            <Badge className={getStatusBadgeColor(classItem.status)}>
                              {classItem.status}
                            </Badge>
                          </div>
                          <div className="md:w-3/4">
                            <h3 className="text-lg font-semibold">{classItem.title}</h3>
                            <p className="text-muted-foreground mb-2">{classItem.description}</p>
                            {classItem.meetingLink && (
                              <Button size="sm" asChild>
                                <a href={classItem.meetingLink} target="_blank" rel="noopener noreferrer">
                                  Start Class Session
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {teacherCourses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your recent classes and course updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentClasses.slice(0, 3).map((classItem) => (
                        <div key={classItem._id} className="flex items-center gap-4 border-b pb-4">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{classItem.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(classItem.scheduledDateTime), "MMMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <div className="ml-auto">
                            <Badge className={getStatusBadgeColor(classItem.status)}>
                              {classItem.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/teacher/schedule">View All Classes</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="courses">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4">Loading your courses...</p>
            </div>
          ) : teacherCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teacherCourses.map((course) => (
                <Card key={course._id} className="overflow-hidden flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {course.description?.substring(0, 100)}{course.description?.length > 100 ? '...' : ''}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge>{course.category}</Badge>
                      <Badge variant="outline">{course.level}</Badge>
                      <Badge variant={course.publicationStatus === "PUBLISHED" ? "default" : "secondary"}>
                        {course.publicationStatus}
                      </Badge>
                    </div>
                    
                    <div className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-3 w-3" />
                        <span>Created: {format(parseISO(course.dateCreated), "MMMM d, yyyy")}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>Last updated: {format(parseISO(course.dateModified), "MMMM d, yyyy")}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 p-4 flex flex-col gap-2">
                    <Button asChild variant="default" className="w-full">
                      <Link to={`/teacher/courses/${course._id}`}>
                        Edit Course
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/teacher/schedule/course/${course._id}`}>
                        Manage Classes
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              <Card className="overflow-hidden flex flex-col items-center justify-center bg-muted/40 border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-full py-6">
                  <div className="rounded-full bg-primary/10 p-3 mb-3">
                    <PlusCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Create New Course</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Add a new course to your teaching portfolio
                  </p>
                  <Button asChild>
                    <Link to="/teacher/courses/new">
                      Create Course
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Courses Found</CardTitle>
                <CardDescription>You haven't created any courses yet.</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="mb-4">Start your teaching journey by creating your first course.</p>
                <Button asChild>
                  <Link to="/courses/new">Create Your First Course</Link>
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
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Upcoming Classes</h2>
                <Button asChild>
                  <Link to="/teacher/schedule">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Manager
                  </Link>
                </Button>
              </div>
              
              {upcomingClasses.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingClasses.slice(0, 5).map((classItem) => {
                          const courseName = teacherCourses.find(
                            c => c._id === (classItem.course._id || classItem.course)
                          )?.title || 'Course';
                          
                          return (
                            <TableRow key={classItem._id}>
                              <TableCell>
                                <div className="font-medium">{classItem.title}</div>
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {classItem.description}
                                </div>
                              </TableCell>
                              <TableCell>{courseName}</TableCell>
                              <TableCell>
                                {format(parseISO(classItem.scheduledDateTime), "MMM d, yyyy h:mm a")}
                              </TableCell>
                              <TableCell>{classItem.duration} min</TableCell>
                              <TableCell>
                                <Badge className={getStatusBadgeColor(classItem.status)}>
                                  {classItem.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {classItem.meetingLink ? (
                                  <Button size="sm" asChild>
                                    <a href={classItem.meetingLink} target="_blank" rel="noopener noreferrer">
                                      <ArrowUpRight className="h-4 w-4 mr-1" /> Start
                                    </a>
                                  </Button>
                                ) : (
                                  <Button size="sm" variant="outline" asChild>
                                    <Link to={`/teacher/schedule/edit/${classItem._id}`}>
                                      Edit
                                    </Link>
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                  {upcomingClasses.length > 5 && (
                    <CardFooter className="border-t bg-muted/50 p-4">
                      <Button variant="outline" asChild className="w-full">
                        <Link to="/teacher/schedule">View All Classes</Link>
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Upcoming Classes</CardTitle>
                    <CardDescription>You don't have any classes scheduled in the future.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-6">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="mb-4">Start by scheduling classes for your courses.</p>
                    <Button asChild>
                      <Link to="/teacher/schedule">Schedule Classes</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks for managing your teaching</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button asChild variant="outline" className="h-auto py-4 justify-start">
                      <Link to="/teacher/schedule/new" className="flex flex-col items-start">
                        <span className="text-base font-medium">Schedule Class</span>
                        <span className="text-sm font-normal text-muted-foreground">Create a new class session</span>
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" className="h-auto py-4 justify-start">
                      <Link to="/teacher/courses/new" className="flex flex-col items-start">
                        <span className="text-base font-medium">Create Course</span>
                        <span className="text-sm font-normal text-muted-foreground">Add a new course</span>
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" className="h-auto py-4 justify-start">
                      <Link to="/teacher/students" className="flex flex-col items-start">
                        <span className="text-base font-medium">View Students</span>
                        <span className="text-sm font-normal text-muted-foreground">See enrolled students</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}