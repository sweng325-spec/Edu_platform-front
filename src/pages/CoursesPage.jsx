import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, PlusCircle } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const { user } = useContext(AuthContext);

  const fetchCourses = async () => {
    try {
      const res = await API.get('courses/');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await API.post('courses/', { title, description, price });
      setTitle('');
      setDescription('');
      setPrice('');
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create course');
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const res = await API.post(`courses/${courseId}/enroll/`);
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.error || 'Enrollment failed');
    }
  };

  return (
    <div className="space-y-8">
      {user?.role === 'TEACHER' && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900 dark:text-white">
            <PlusCircle className="w-5 h-5 mr-2 text-indigo-500" /> Create New Course
          </h3>
          <form onSubmit={handleCreateCourse} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg outline-none text-sm"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price ($)"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg outline-none text-sm"
            />
            <input
              type="text"
              placeholder="Description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg outline-none text-sm md:col-span-2"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition">
              Publish Course
            </button>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-indigo-500" /> Available Courses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{course.title}</h3>
                <p className="text-xs text-indigo-500 font-semibold mt-1">Instructor: {course.teacher_name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{course.description}</p>
              </div>
              <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xl font-extrabold text-gray-900 dark:text-white">${course.price}</span>
                {user?.role === 'STUDENT' && (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}