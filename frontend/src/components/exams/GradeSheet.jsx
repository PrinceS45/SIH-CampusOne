import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PrinterIcon, DownloadIcon } from 'lucide-react';
import useStudentStore from '../../stores/studentStore';
import useExamStore from '../../stores/examStore';
import Loader from '../common/Loader';

const GradeSheet = () => {
  const { studentId } = useParams();
  const { currentStudent, getStudent, loading: studentLoading } = useStudentStore();
  const { exams, getStudentExams, loading: examsLoading } = useExamStore();
  const [currentDate] = useState(new Date().toLocaleDateString());
  const [selectedSemester, setSelectedSemester] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (studentId) {
          await getStudent(studentId);
          await getStudentExams(studentId);
        }
      } catch (err) {
        setError('Failed to load student data');
        console.error('Error fetching student data:', err);
      }
    };
    
    fetchData();
  }, [studentId, getStudent, getStudentExams]);

  const handlePrint = () => {
    window.print();
  };

  const filteredExams = selectedSemester
    ? exams.filter(exam => exam.semester === parseInt(selectedSemester))
    : exams;

  const semesterOptions = [...new Set(exams.map(exam => exam.semester))].sort();

  if (studentLoading || examsLoading) return <Loader />;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!currentStudent) return <div className="text-center py-8">Student not found</div>;

  const calculateSemesterGPA = (semesterExams) => {
    if (semesterExams.length === 0) return 0;

    const gradePoints = {
      'A+': 4.0, 'A': 4.0, 'B+': 3.5, 'B': 3.0,
      'C+': 2.5, 'C': 2.0, 'D': 1.0, 'F': 0.0, 'I': 0.0
    };

    const totalPoints = semesterExams.reduce((sum, exam) => {
      return sum + (gradePoints[exam.grade] || 0);
    }, 0);

    return (totalPoints / semesterExams.length).toFixed(2);
  };

  const calculateCGPA = () => {
    if (exams.length === 0) return 0;

    const gradePoints = {
      'A+': 4.0, 'A': 4.0, 'B+': 3.5, 'B': 3.0,
      'C+': 2.5, 'C': 2.0, 'D': 1.0, 'F': 0.0, 'I': 0.0
    };

    const totalPoints = exams.reduce((sum, exam) => {
      return sum + (gradePoints[exam.grade] || 0);
    }, 0);

    return (totalPoints / exams.length).toFixed(2);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      {/* Printable Grade Sheet */}
      <div className="print:bg-white print:p-0">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">College Name</h1>
          <p className="text-gray-600">Address Line 1, City, State - PIN Code</p>
          <p className="text-gray-600">Phone: +91 XXXXX XXXXX | Email: college@example.com</p>
          <h2 className="text-xl font-semibold text-blue-600 mt-2">GRADE SHEET</h2>
        </div>

        {/* Student Information */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Information</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Name:</span> {currentStudent.firstName} {currentStudent.lastName}</p>
              <p><span className="font-medium">ID:</span> {currentStudent.studentId}</p>
              <p><span className="font-medium">Course:</span> {currentStudent.course}</p>
              <p><span className="font-medium">Branch:</span> {currentStudent.branch}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Academic Information</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Current Semester:</span> {currentStudent.semester}</p>
              <p><span className="font-medium">CGPA:</span> {calculateCGPA()}</p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-1 px-2 py-1 text-xs font-semibold rounded-full ${
                  currentStudent.status === 'active' ? 'bg-green-100 text-green-800' :
                  currentStudent.status === 'inactive' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentStudent.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Semester Filter (Non-printable) */}
        <div className="mb-6 print:hidden">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Semester
          </label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Semesters</option>
            {semesterOptions.map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>

        {/* Grades Table */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {selectedSemester ? `Semester ${selectedSemester} Results` : 'All Semester Results'}
          </h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Semester</th>
                <th className="border border-gray-300 px-4 py-2">Subject</th>
                <th className="border border-gray-300 px-4 py-2">Exam Type</th>
                <th className="border border-gray-300 px-4 py-2">Marks</th>
                <th className="border border-gray-300 px-4 py-2">Grade</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.map((exam, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2 text-center">Sem {exam.semester}</td>
                  <td className="border border-gray-300 px-4 py-2">{exam.subject}</td>
                  <td className="border border-gray-300 px-4 py-2 capitalize">{exam.examType}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{exam.marksObtained}/{exam.maximumMarks}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center font-bold">{exam.grade}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      exam.status === 'pass' ? 'bg-green-100 text-green-800' :
                      exam.status === 'fail' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {new Date(exam.examDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredExams.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No exam records found{selectedSemester ? ` for Semester ${selectedSemester}` : ''}.
            </div>
          )}
        </div>

        {/* GPA Summary */}
        {selectedSemester && filteredExams.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Semester {selectedSemester} Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><span className="font-medium">Semester GPA:</span> {calculateSemesterGPA(filteredExams)}</p>
                <p><span className="font-medium">Total Subjects:</span> {filteredExams.length}</p>
              </div>
              <div>
                <p><span className="font-medium">Passed Subjects:</span> {filteredExams.filter(e => e.status === 'pass').length}</p>
                <p><span className="font-medium">Failed Subjects:</span> {filteredExams.filter(e => e.status === 'fail').length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="text-center">
            <p className="font-semibold">Registrar Signature</p>
            <div className="h-16 border-b border-gray-300 mt-2 mx-auto w-48"></div>
          </div>
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              This is an official grade sheet issued by the college administration.
            </p>
            <p className="text-xs text-gray-500">Generated on: {currentDate}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-6 print:hidden">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <PrinterIcon className="h-5 w-5" />
          <span>Print Grade Sheet</span>
        </button>
        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-6 py-2 rounded-md flex items-center space-x-2 hover:bg-green-700"
        >
          <DownloadIcon className="h-5 w-5" />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:bg-white, .print\\:bg-white * {
              visibility: visible;
            }
            .print\\:bg-white {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
            }
            .print\\:p-0 {
              padding: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default GradeSheet;