import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import Student from '../models/Student.js';

// Mark attendance for a list of users (Students or Staff)
export const markAttendance = async (req, res) => {
  try {
    const { attendanceData, date, role } = req.body;
    
    if (!attendanceData || !date || !role) {
      return res.status(400).json({ message: "Attendance data, date, and role are required" });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const bulkOps = attendanceData.map((item) => {
      const { userId, studentProfileId, status, remarks } = item;
      
      let query = { date: attendanceDate };
      if (role === 'student' && studentProfileId) {
        query.studentProfile = studentProfileId;
      } else {
        query.user = userId;
      }

      return {
        updateOne: {
          filter: query,
          update: { 
            user: userId || undefined,
            studentProfile: studentProfileId || undefined,
            date: attendanceDate,
            status,
            role,
            markedBy: req.user.id,
            remarks
          },
          upsert: true,
          setDefaultsOnInsert: true
        }
      };
    });

    const result = await Attendance.bulkWrite(bulkOps);
    console.log(`Bulk attendance complete for ${role}s. Matched: ${result.matchedCount}, Upserted: ${result.upsertedCount}`);
    
    res.status(200).json({ 
      message: "Attendance marked successfully",
      summary: { matched: result.matchedCount, upserted: result.upsertedCount }
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get students for marking attendance
export const getStudentsForAttendance = async (req, res) => {
  try {
    const { course, semester, branch, date } = req.query;
    
    if (!date) return res.status(400).json({ message: "Date is required" });

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    let query = {};
    if (course) query.course = course;
    if (semester) query.semester = semester;
    if (branch) query.branch = branch;

    const students = await Student.find(query).select('firstName lastName studentId photo email course semester branch');
    
    // Also need their User IDs for the Attendance model
    const studentEmails = students.map(s => s.email);
    const users = await User.find({ email: { $in: studentEmails } }).select('email _id');
    
    // Find existing attendance for these students on this date
    const studentProfileIds = students.map(s => s._id);
    const existingRecords = await Attendance.find({
      date: attendanceDate,
      studentProfile: { $in: studentProfileIds }
    }).select('studentProfile status');

    const combinedData = students.map(student => {
      const user = users.find(u => u.email === student.email);
      const existing = existingRecords.find(r => r.studentProfile.toString() === student._id.toString());
      
      return {
        _id: user?._id,
        studentProfileId: student._id,
        name: `${student.firstName} ${student.lastName}`,
        studentId: student.studentId,
        photo: student.photo,
        email: student.email,
        course: student.course,
        semester: student.semester,
        branch: student.branch,
        existingStatus: existing ? existing.status : null
      };
    });

    res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error fetching students for attendance:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get staff for marking attendance (Admin only)
export const getStaffForAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const staff = await User.find({ role: 'staff', isActive: true })
      .select('name email profilePicture department');

    const staffIds = staff.map(s => s._id);
    const existingRecords = await Attendance.find({
      date: attendanceDate,
      user: { $in: staffIds },
      role: 'staff'
    }).select('user status');

    const combinedData = staff.map(s => {
      const existing = existingRecords.find(r => r.user.toString() === s._id.toString());
      return {
        _id: s._id,
        name: s.name,
        email: s.email,
        profilePicture: s.profilePicture,
        department: s.department,
        existingStatus: existing ? existing.status : null
      };
    });

    res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error fetching staff for attendance:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get attendance records with filters
export const getAttendanceRecords = async (req, res) => {
  try {
    const { date, role, course, semester } = req.query;
    
    let query = {};
    if (date) {
      const filterDate = new Date(date);
      filterDate.setHours(0, 0, 0, 0);
      query.date = filterDate;
    }
    if (role) query.role = role;

    let attendance = await Attendance.find(query)
      .populate('user', 'name email profilePicture')
      .populate('studentProfile', 'firstName lastName course semester branch studentId photo')
      .populate('markedBy', 'name')
      .sort({ createdAt: -1 });

    // Optional further filtering for students in memory or via studentProfile
    if (role === 'student' && (course || semester)) {
      attendance = attendance.filter(record => {
        if (!record.studentProfile) return false;
        let match = true;
        if (course && record.studentProfile.course !== course) match = false;
        if (semester && record.studentProfile.semester != semester) match = false;
        return match;
      });
    }

    res.status(200).json(attendance);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get personal attendance history
export const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ user: req.user.id })
      .sort({ date: -1 });
    res.status(200).json(attendance);
  } catch (error) {
    console.error("Error fetching personal attendance:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Unmark attendance (Delete record)
export const unmarkAttendance = async (req, res) => {
  try {
    const { userId, studentProfileId, date, role } = req.body;

    if (!date || !role || (!userId && !studentProfileId)) {
      return res.status(400).json({ message: "Date, role and member ID are required" });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    let query = { date: attendanceDate, role };
    if (role === 'student' && studentProfileId) {
      query.studentProfile = studentProfileId;
    } else {
      query.user = userId;
    }

    await Attendance.findOneAndDelete(query);
    
    res.status(200).json({ message: "Attendance unmarked successfully" });
  } catch (error) {
    console.error("Error unmarking attendance:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
