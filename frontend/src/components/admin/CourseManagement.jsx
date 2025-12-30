import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    category: 'Accounting',
    description: '',
    shortDescription: '',
    level: 'Beginner',
    status: 'Active',
    duration: '',
    fees: '',
    maxStudents: 30,
    prerequisites: [''],
    outcomes: [''],
    syllabus: [{ module: '', topics: [''] }]
  });

  const categories = ['Accounting', 'Designing', '10+2/ College Students', 'IT For Beginners', 'Diploma', 'Global IT Certifications'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const statuses = ['Active', 'Featured', 'Upcoming'];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data.courses || response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const courseData = {
        ...formData,
        duration: parseInt(formData.duration),
        fees: parseFloat(formData.fees),
        maxStudents: parseInt(formData.maxStudents),
        prerequisites: formData.prerequisites.filter(p => p.trim()),
        outcomes: formData.outcomes.filter(o => o.trim()),
        syllabus: formData.syllabus.filter(s => s.module.trim()).map(s => ({
          ...s,
          topics: s.topics.filter(t => t.trim())
        }))
      };

      if (editingCourse) {
        await axios.put(`http://localhost:5000/api/courses/${editingCourse._id}`, courseData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/courses', courseData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      fetchCourses();
      setShowModal(false);
      setEditingCourse(null);
      resetForm();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || '',
      code: course.code || '',
      category: course.category || 'Accounting',
      description: course.description || '',
      shortDescription: course.shortDescription || '',
      level: course.level || 'Beginner',
      status: course.status || 'Active',
      duration: (course.duration || 0).toString(),
      fees: (course.fees || 0).toString(),
      maxStudents: course.maxStudents?.toString() || '30',
      prerequisites: course.prerequisites && course.prerequisites.length > 0 ? course.prerequisites : [''],
      outcomes: course.outcomes && course.outcomes.length > 0 ? course.outcomes : [''],
      syllabus: course.syllabus && course.syllabus.length > 0 ? course.syllabus : [{ module: '', topics: [''] }]
    });
    setShowModal(true);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      code: '',
      category: 'Accounting',
      description: '',
      shortDescription: '',
      level: 'Beginner',
      status: 'Active',
      duration: '',
      fees: '',
      maxStudents: 30,
      prerequisites: [''],
      outcomes: [''],
      syllabus: [{ module: '', topics: [''] }]
    });
  };

  const addPrerequisite = () => {
    setFormData(prev => ({
      ...prev,
      prerequisites: [...prev.prerequisites, '']
    }));
  };

  const removePrerequisite = (index) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const addOutcome = () => {
    setFormData(prev => ({
      ...prev,
      outcomes: [...prev.outcomes, '']
    }));
  };

  const removeOutcome = (index) => {
    setFormData(prev => ({
      ...prev,
      outcomes: prev.outcomes.filter((_, i) => i !== index)
    }));
  };

  const addSyllabusModule = () => {
    setFormData(prev => ({
      ...prev,
      syllabus: [...prev.syllabus, { module: '', topics: [''] }]
    }));
  };

  const removeSyllabusModule = (index) => {
    setFormData(prev => ({
      ...prev,
      syllabus: prev.syllabus.filter((_, i) => i !== index)
    }));
  };

  const addTopic = (moduleIndex) => {
    setFormData(prev => ({
      ...prev,
      syllabus: prev.syllabus.map((module, i) => 
        i === moduleIndex 
          ? { ...module, topics: [...module.topics, ''] }
          : module
      )
    }));
  };

  const removeTopic = (moduleIndex, topicIndex) => {
    setFormData(prev => ({
      ...prev,
      syllabus: prev.syllabus.map((module, i) => 
        i === moduleIndex 
          ? { ...module, topics: module.topics.filter((_, j) => j !== topicIndex) }
          : module
      )
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
          <button
            onClick={() => {
              resetForm();
              setEditingCourse(null);
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Course
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{course.title}</div>
                      <div className="text-sm text-gray-500">{course.shortDescription}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.level}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.duration} months
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{course.fees ? Number(course.fees).toLocaleString() : '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      course.status === 'Featured' ? 'bg-yellow-100 text-yellow-800' :
                      course.status === 'Upcoming' ? 'bg-gray-100 text-gray-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(course)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Course Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Course Code</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Short Description</label>
                  <input
                    type="text"
                    required
                    value={formData.shortDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (months)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fees (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.fees}
                      onChange={(e) => setFormData(prev => ({ ...prev, fees: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Students</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prerequisites</label>
                  {formData.prerequisites.map((prereq, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={prereq}
                        onChange={(e) => {
                          const newPrereqs = [...formData.prerequisites];
                          newPrereqs[index] = e.target.value;
                          setFormData(prev => ({ ...prev, prerequisites: newPrereqs }));
                        }}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter prerequisite"
                      />
                      {formData.prerequisites.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePrerequisite(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPrerequisite}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add Prerequisite
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Learning Outcomes</label>
                  {formData.outcomes.map((outcome, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={outcome}
                        onChange={(e) => {
                          const newOutcomes = [...formData.outcomes];
                          newOutcomes[index] = e.target.value;
                          setFormData(prev => ({ ...prev, outcomes: newOutcomes }));
                        }}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter learning outcome"
                      />
                      {formData.outcomes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOutcome(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOutcome}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add Outcome
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Syllabus</label>
                  {formData.syllabus.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="border border-gray-300 rounded-md p-4 mb-4">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={module.module}
                          onChange={(e) => {
                            const newSyllabus = [...formData.syllabus];
                            newSyllabus[moduleIndex].module = e.target.value;
                            setFormData(prev => ({ ...prev, syllabus: newSyllabus }));
                          }}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                          placeholder="Module name"
                        />
                        {formData.syllabus.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSyllabusModule(moduleIndex)}
                            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Remove Module
                          </button>
                        )}
                      </div>
                      <div className="ml-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Topics</label>
                        {module.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={topic}
                              onChange={(e) => {
                                const newSyllabus = [...formData.syllabus];
                                newSyllabus[moduleIndex].topics[topicIndex] = e.target.value;
                                setFormData(prev => ({ ...prev, syllabus: newSyllabus }));
                              }}
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                              placeholder="Enter topic"
                            />
                            {module.topics.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTopic(moduleIndex, topicIndex)}
                                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addTopic(moduleIndex)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Add Topic
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSyllabusModule}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add Module
                  </button>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingCourse(null);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingCourse ? 'Update Course' : 'Add Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
