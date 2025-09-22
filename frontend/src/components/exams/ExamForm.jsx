import { useState, useEffect } from 'react';
import { SaveIcon, PlusIcon } from 'lucide-react';
import useExamStore from '../../stores/examStore';
import useStudentStore from '../../stores/studentStore';
import Modal from '../common/Modal';
import Loader from '../common/Loader';

const ExamForm = () => {
  const { loading, createExam } = useExamStore();
  const { students, getStudents, loading: studentsLoading } = useStudentStore();
  const [showExamModal, setShowExamModal] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    examType: 'midterm',
    subject: '',
    course: 'B.Tech',
    semester: 1,
    maximumMarks: 100,
    marksObtained: 0,
    examDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  useEffect(() => {
    getStudents({ limit: 1000 });
  }, [getStudents]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maximumMarks' || name === 'marksObtained' || name === 'semester' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createExam(formData);
      setShowExamModal(false);
      setFormData({
        studentId: '',
        examType: 'midterm',
        subject: '',
        course: 'B.Tech',
        semester: 1,
        maximumMarks: 100,
        marksObtained: 0,
        examDate: new Date().toISOString().split('T')[0],
        remarks: ''
      });
    } catch (error) {
      console.error('Error creating exam record:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-gray-600">Record and manage exam results</p>
        </div>
        <button
          onClick={() => setShowExamModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Exam Result</span>
        </button>
      </div>

      {/* Exam Form Modal */}
      <Modal
        isOpen={showExamModal}
        onClose={() => setShowExamModal(false)}
        title="Add Exam Result"
        size="lg"
      >
        {studentsLoading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student *</label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.firstName} {student.lastName} ({student.studentId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Exam Type *</label>
                <select
                  name="examType"
                  value={formData.examType}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="midterm">Midterm</option>
                  <option value="final">Final</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter subject name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Course *</label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="MBA">MBA</option>
                  <option value="MCA">MCA</option>
                  <option value="BBA">BBA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Semester *</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Maximum Marks *</label>
                <input
                  type="number"
                  name="maximumMarks"
                  value={formData.maximumMarks}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Marks Obtained *</label>
                <input
                  type="number"
                  name="marksObtained"
                  value={formData.marksObtained}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max={formData.maximumMarks}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Exam Date *</label>
                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional remarks about the exam"
              />
            </div>

            {/* Grade Preview */}
            {formData.maximumMarks > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Grade Preview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Percentage: </span>
                    <span className="font-medium">
                      {((formData.marksObtained / formData.maximumMarks) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status: </span>
                    <span className={`font-medium ${
                      (formData.marksObtained / formData.maximumMarks) >= 0.35 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(formData.marksObtained / formData.maximumMarks) >= 0.35 ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowExamModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
              >
                <SaveIcon className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Result'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Recent Exam Results will be added here */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Exam Results</h3>
        <p className="text-gray-500 text-center py-8">
          Exam results will be displayed here once added. Use the "Add Exam Result" button to get started.
        </p>
      </div>
    </div>
  );
};

export default ExamForm;