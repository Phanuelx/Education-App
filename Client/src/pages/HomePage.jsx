// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { courseAPI } from "@/services/api";
import { motion } from "framer-motion"; // Add framer-motion for animations

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Megaphone } from "lucide-react"

export default function HomePage() {
  const { isAuthenticated, currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Get only published courses for public view
        const response = await courseAPI.getAll();
        if (response.data.success) {
          const publishedCourses = response.data.courses.filter(
            course => course.publicationStatus === "PUBLISHED"
          );
          setCourses(publishedCourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <motion.div 
        className="w-full bg-yellow-100 text-yellow-800 py-2 px-4 text-center text-sm font-medium"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        🎉 New: Live sessions feature is now available for all instructors!
      </motion.div>

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white opacity-10"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-20 w-80 h-80 rounded-full bg-indigo-400 opacity-10"
          animate={{
            x: [0, -30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Unlock Your Potential
          </motion.h1>
          <motion.p 
            className="text-lg mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Learn from top instructors anytime, anywhere.
          </motion.p>
          <motion.div 
            className="flex justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild variant="secondary">
                <Link to="/register">Get Started</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild variant="outline" className="text-white border-white">
                <Link to="/login">Login</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <motion.section 
        className="max-w-6xl mx-auto px-4 py-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            placeholder="Search courses"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Input
            placeholder="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
          <Input
            placeholder="Level"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          />
        </div>

        {/* Courses Section */}
        {loading ? (
          <div className="text-center">
            <motion.div 
              className="inline-block w-8 h-8 border-4 border-indigo-600 border-b-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="mt-2">Loading courses...</p>
          </div>
        ) : (
          <motion.div 
            className="grid gap-6 md:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {courses
              .filter(
                (course) =>
                  course.title
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) &&
                  course.category
                    .toLowerCase()
                    .includes(categoryFilter.toLowerCase()) &&
                  course.level.toLowerCase().includes(levelFilter.toLowerCase())
              )
              .map((course) => (
                <motion.div
                  key={course._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        type: "spring",
                        stiffness: 100
                      }
                    }
                  }}
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                    transition: { duration: 0.2 }
                  }}
                  className="bg-gray-100 p-4 rounded-lg shadow"
                >
                  <h2 className="text-xl font-semibold">{course.title}</h2>
                  <p className="text-sm text-gray-600">{course.description}</p>
                  <div className="mt-2">
                    <span className="text-sm font-medium">Category:</span>{" "}
                    {course.category}
                  </div>
                  <div className="text-sm text-gray-500">
                    Level: {course.level}
                  </div>
                  <motion.div 
                    className="mt-4"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button asChild className="w-full">
                      <Link to={`/courses/${course._id}`}>View Course</Link>
                    </Button>
                  </motion.div>
                </motion.div>
              ))}
          </motion.div>
        )}
      </motion.section>
    </div>
  );
}