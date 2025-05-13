// src/components/teacher/ClassScheduler.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO, isToday, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { classAPI, courseAPI } from "@/services/api";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ChevronLeft, ChevronRight, CalendarIcon, Clock, Video, Edit, Trash2, CheckCircle, AlertCircle, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

// Simple custom toast component
const CustomToast = ({ title, message, type, onClose }) => {
  const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  const Icon = type === "success" ? CheckCircle : AlertCircle;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded shadow-md ${bgColor} flex items-start gap-3 animate-in fade-in duration-300`}>
      <Icon className="h-5 w-5" />
      <div className="flex-1">
        <h4 className={`font-medium ${textColor}`}>{title}</h4>
        <p className={`text-sm ${textColor}`}>{message}</p>
      </div>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default function ClassScheduler() {
  const { currentUser } = useAuth();
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeView, setActiveView] = useState("calendar");
  
  // Custom toast state
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    scheduledDateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    duration: 60,
    status: "SCHEDULED",
    meetingLink: "",
  });

  // Show toast helper function
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
    fetchClasses();
    fetchTeacherCourses();
  }, [currentUser]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      // In a real app, you would filter by teacher ID
      const response = await classAPI.getAll();
      if (response.data.success) {
        // Filter classes to only show those taught by current teacher
        const teacherClasses = response.data.classes.filter(
          classItem => classItem.user === currentUser?._id
        );
        setClasses(teacherClasses);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      showToast("Error", "Failed to load classes", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherCourses = async () => {
    try {
      // In a real app, you would fetch only courses taught by this teacher
      const response = await courseAPI.getAll();
      if (response.data.success) {
        // For demo purposes, assume all courses are available to this teacher
        setTeacherCourses(response.data.courses);
      }
    } catch (error) {
      console.error("Error fetching teacher courses:", error);
      showToast("Error", "Failed to load courses", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare data for API
      const classData = {
        title: formData.title,
        description: formData.description,
        course: formData.course,
        user: currentUser._id, // Teacher ID
        scheduledDateTime: formData.scheduledDateTime,
        duration: Number(formData.duration),
        status: formData.status,
      };
      
      const response = await classAPI.create(classData);
      
      if (response.data.success) {
        showToast("Success", "Class created successfully");
        
        setClasses(prevClasses => [...prevClasses, response.data.class]);
        setIsCreateDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error creating class:", error);
      showToast(
        "Error", 
        error.response?.data?.message || "Failed to create class", 
        "error"
      );
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    
    try {
      if (!selectedClass) return;
      
      const classData = {
        title: formData.title,
        description: formData.description,
        scheduledDateTime: formData.scheduledDateTime,
        duration: Number(formData.duration),
        status: formData.status,
      };
      
      const response = await classAPI.update(selectedClass._id, classData);
      
      if (response.data.success) {
        showToast("Success", "Class updated successfully");
        
        setClasses(prevClasses => prevClasses.map(cls => 
          cls._id === selectedClass._id ? response.data.class : cls
        ));
        setIsUpdateDialogOpen(false);
      }
    } catch (error) {
      console.error("Error updating class:", error);
      showToast(
        "Error", 
        error.response?.data?.message || "Failed to update class", 
        "error"
      );
    }
  };

  const handleDeleteClass = async (classId) => {
    try {
      const response = await classAPI.delete(classId);
      
      if (response.data.success) {
        showToast("Success", "Class deleted successfully");
        
        setClasses(prevClasses => prevClasses.filter(cls => cls._id !== classId));
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      showToast(
        "Error", 
        error.response?.data?.message || "Failed to delete class", 
        "error"
      );
    }
  };

  const openUpdateDialog = (classItem) => {
    setSelectedClass(classItem);
    
    // Format date from ISO to input format
    const scheduledDateTime = format(
      parseISO(classItem.scheduledDateTime), 
      "yyyy-MM-dd'T'HH:mm"
    );
    
    setFormData({
      title: classItem.title,
      description: classItem.description,
      course: classItem.course._id || classItem.course,
      scheduledDateTime,
      duration: classItem.duration,
      status: classItem.status,
      meetingLink: classItem.meetingLink || "",
    });
    
    setIsUpdateDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      course: "",
      scheduledDateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      duration: 60,
      status: "SCHEDULED",
      meetingLink: "",
    });
  };

  // Get classes for a specific day
  const getClassesForDay = (day) => {
    return classes.filter(cls => {
      const classDate = parseISO(cls.scheduledDateTime);
      return isSameDay(classDate, day);
    });
  };

  // Format time from ISO string
  const formatTime = (isoString) => {
    return format(parseISO(isoString), "h:mm a");
  };

  // Get week dates for calendar view
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Start from Monday
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Format day header
  const formatDayHeader = (day) => {
    return format(day, 'EEE dd'); // e.g. "Mon 01"
  };

  // Navigate weeks
  const prevWeek = () => {
    setDate(addDays(date, -7));
  };

  const nextWeek = () => {
    setDate(addDays(date, 7));
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
    <div className="space-y-6">
      {/* Custom Toast */}
      {toast && (
        <CustomToast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Class Schedule</h2>
          <p className="text-muted-foreground">
            Create and manage your class sessions
          </p>
        </div>
        <Button onClick={() => {
          resetForm();
          setIsCreateDialogOpen(true);
        }} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule Class
        </Button>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={prevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="ml-2 text-sm font-medium py-2">
                {format(weekStart, 'MMMM d')} - {format(weekEnd, 'MMMM d, yyyy')}
              </div>
            </div>
          </div>

          {/* Calendar View */}
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day) => (
              <div key={day.toString()} className="border rounded-lg overflow-hidden">
                <div className={`p-2 text-center font-medium ${isToday(day) ? 'bg-blue-100' : 'bg-gray-50'}`}>
                  {formatDayHeader(day)}
                </div>
                <div className="p-2 min-h-[150px]">
                  {getClassesForDay(day).map(classItem => (
                    <Card key={classItem._id} className="mb-2 bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer" onClick={() => openUpdateDialog(classItem)}>
                      <CardContent className="p-2">
                        <div className="text-xs font-medium">
                          {teacherCourses.find(c => c._id === classItem.course)?.title || 'Course'}
                        </div>
                        <div className="text-sm font-semibold truncate">{classItem.title}</div>
                        <div className="text-xs text-gray-500">
                          {formatTime(classItem.scheduledDateTime)} - {classItem.duration} min
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          {/* List View */}
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.length > 0 ? (
                    classes.map((classItem) => {
                      const courseTitle = teacherCourses.find(
                        c => c._id === (classItem.course._id || classItem.course)
                      )?.title || 'Course';
                      
                      return (
                        <TableRow key={classItem._id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{classItem.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-md">
                                {classItem.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{courseTitle}</TableCell>
                          <TableCell>
                            {format(parseISO(classItem.scheduledDateTime), "MMM d, yyyy h:mm a")}
                          </TableCell>
                          <TableCell>{classItem.duration} minutes</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(classItem.status)}>
                              {classItem.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="icon" onClick={(e) => {
                                e.stopPropagation();
                                openUpdateDialog(classItem);
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="text-red-500 hover:text-red-600"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the class "{classItem.title}".
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteClass(classItem._id)} 
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No classes scheduled. Click 'Schedule Class' to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Class Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Schedule New Class</DialogTitle>
            <DialogDescription>
              Fill in the details to schedule a new class for your course.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateClass}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="course">Course</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => handleSelectChange("course", value)}
                  required
                >
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherCourses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
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
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Introduction to React Hooks"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="What will be covered in this class"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="scheduledDateTime">Date & Time</Label>
                  <Input
                    id="scheduledDateTime"
                    name="scheduledDateTime"
                    type="datetime-local"
                    value={formData.scheduledDateTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="15"
                    step="5"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="meetingLink">Meeting Link (optional)</Label>
                <Input
                  id="meetingLink"
                  name="meetingLink"
                  value={formData.meetingLink}
                  onChange={handleInputChange}
                  placeholder="https://meet.example.com/class"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Schedule Class</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Class Dialog */}
      {selectedClass && (
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Update Class</DialogTitle>
              <DialogDescription>
                Update details for the class "{selectedClass.title}"
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateClass}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="update-title">Class Title</Label>
                  <Input
                    id="update-title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="update-description">Description</Label>
                  <Textarea
                    id="update-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="update-scheduledDateTime">Date & Time</Label>
                    <Input
                      id="update-scheduledDateTime"
                      name="scheduledDateTime"
                      type="datetime-local"
                      value={formData.scheduledDateTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="update-duration">Duration (minutes)</Label>
                    <Input
                      id="update-duration"
                      name="duration"
                      type="number"
                      min="15"
                      step="5"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="update-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                    required
                  >
                    <SelectTrigger id="update-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="update-meetingLink">Meeting Link (optional)</Label>
                  <Input
                    id="update-meetingLink"
                    name="meetingLink"
                    value={formData.meetingLink}
                    onChange={handleInputChange}
                    placeholder="https://meet.example.com/class"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Class</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}