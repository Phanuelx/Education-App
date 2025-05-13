// src/components/teacher/ScheduleCalendar.jsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, getDay, parseISO, isSameDay } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

import ScheduleForm from "./ScheduleForm";

export default function ScheduleCalendar() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date());
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // This would normally fetch courses and schedules from your API
    // For now, we'll use mock data
    const mockCourses = [
      { id: 1, title: "Introduction to React" },
      { id: 2, title: "Advanced JavaScript Techniques" },
      { id: 3, title: "CSS Grid and Flexbox Mastery" },
    ];
    
    const mockSchedules = [
      {
        id: 1,
        title: "React Components and Props",
        course: { id: 1, title: "Introduction to React" },
        startTime: "2023-04-22T10:00:00",
        endTime: "2023-04-22T11:30:00",
        description: "Learn about React components and how to use props",
        meetingLink: "https://meet.example.com/react-class",
      },
      {
        id: 2,
        title: "JavaScript Closures",
        course: { id: 2, title: "Advanced JavaScript Techniques" },
        startTime: "2023-04-24T14:00:00",
        endTime: "2023-04-24T15:30:00",
        description: "Understanding closures and their practical applications",
        meetingLink: "https://meet.example.com/js-closures",
      },
      {
        id: 3,
        title: "Building Layouts with Grid",
        course: { id: 3, title: "CSS Grid and Flexbox Mastery" },
        startTime: "2023-04-25T09:00:00",
        endTime: "2023-04-25T10:30:00",
        description: "Creating complex layouts with CSS Grid",
        meetingLink: "https://meet.example.com/css-grid",
      },
    ];
    
    setCourses(mockCourses);
    setSchedules(mockSchedules);
    setLoading(false);
  }, []);

  // Get current week dates
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Start from Monday
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Format day header
  const formatDayHeader = (day) => {
    return format(day, 'EEE dd'); // e.g. "Mon 01"
  };

  // Get schedules for a day
  const getSchedulesForDay = (day) => {
    return schedules.filter(schedule => {
      const scheduleDate = parseISO(schedule.startTime);
      return isSameDay(scheduleDate, day);
    });
  };

  // Get time from ISO string
  const getTimeFromISO = (isoString) => {
    return format(parseISO(isoString), 'h:mm a'); // e.g. "10:00 AM"
  };

  // Navigate weeks
  const prevWeek = () => {
    setDate(addDays(date, -7));
  };

  const nextWeek = () => {
    setDate(addDays(date, 7));
  };

  const handleAddSchedule = (newSchedule) => {
    setSchedules([...schedules, { ...newSchedule, id: schedules.length + 1 }]);
  };

  return (
    <div className="space-y-6">
      {/* Calendar UI implementation */}
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
        <Button onClick={() => setIsScheduleFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule Class
        </Button>
      </div>

      {/* Desktop calendar view */}
      <div className="hidden md:block">
        {/* Calendar implementation */}
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => (
            <div key={day.toString()} className="border rounded-lg overflow-hidden">
              <div className={`p-2 text-center font-medium ${isSameDay(day, new Date()) ? 'bg-blue-100' : 'bg-gray-50'}`}>
                {formatDayHeader(day)}
              </div>
              <div className="p-2 min-h-[150px]">
                {getSchedulesForDay(day).map(schedule => (
                  <Card key={schedule.id} className="mb-2 bg-blue-50 border-blue-200">
                    <CardContent className="p-2">
                      <div className="text-xs font-medium">{schedule.course.title}</div>
                      <div className="text-sm font-semibold truncate">{schedule.title}</div>
                      <div className="text-xs text-gray-500">
                        {getTimeFromISO(schedule.startTime)} - {getTimeFromISO(schedule.endTime)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile calendar view */}
      <div className="md:hidden">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
        />
        
        {/* Mobile schedule list */}
        <div className="mt-4 space-y-4">
          {/* Mobile schedule implementation */}
        </div>
      </div>

      {/* Schedule form modal */}
      {isScheduleFormOpen && (
        <ScheduleForm
          open={isScheduleFormOpen}
          onOpenChange={setIsScheduleFormOpen}
          onScheduleCreated={handleAddSchedule}
          courses={courses}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}