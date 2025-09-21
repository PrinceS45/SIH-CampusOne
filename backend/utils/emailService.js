import nodemailer from 'nodemailer';

const createTransporter = () => {
  try {
    // Check if SMTP configuration exists
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP configuration not found. Email service disabled.');
      return null;
    }

    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } catch (error) {
    console.error('Error creating email transporter:', error);
    return null;
  }
};

export const sendWelcomeEmail = async (user, password) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn('Email transporter not available. Skipping welcome email.');
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: 'Welcome to Student ERP System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Student ERP System</h2>
          <p>Hello ${user.name},</p>
          <p>Your account has been created successfully.</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <p>Please login and change your password after first login.</p>
          <br>
          <p>Best regards,<br>ERP System Admin</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', user.email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

export const sendFeeReceipt = async (fee, student) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn('Email transporter not available. Skipping fee receipt email.');
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: student.email,
      subject: `Fee Receipt - ${fee.receiptNo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Fee Payment Receipt</h2>
          <p>Dear ${student.firstName} ${student.lastName},</p>
          <p>Your fee payment has been processed successfully.</p>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">Payment Details</h3>
            <p><strong>Receipt No:</strong> ${fee.receiptNo}</p>
            <p><strong>Student ID:</strong> ${student.studentId}</p>
            <p><strong>Amount Paid:</strong> ₹${fee.paidAmount}</p>
            <p><strong>Total Amount:</strong> ₹${fee.amount}</p>
            <p><strong>Balance:</strong> ₹${fee.balance}</p>
            <p><strong>Payment Date:</strong> ${new Date(fee.paymentDate).toLocaleDateString()}</p>
            <p><strong>Payment Mode:</strong> ${fee.paymentMode}</p>
          </div>
          <p>Thank you for your payment.</p>
          <br>
          <p>Best regards,<br>College Administration</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Fee receipt email sent to:', student.email);
  } catch (error) {
    console.error('Error sending fee receipt email:', error);
  }
};

export const sendExamResult = async (exam, student) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn('Email transporter not available. Skipping exam result email.');
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: student.email,
      subject: `Exam Result - ${exam.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Exam Result Notification</h2>
          <p>Dear ${student.firstName} ${student.lastName},</p>
          <p>Your exam results have been published.</p>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">Result Details</h3>
            <p><strong>Subject:</strong> ${exam.subject}</p>
            <p><strong>Exam Type:</strong> ${exam.examType}</p>
            <p><strong>Marks Obtained:</strong> ${exam.marksObtained}/${exam.maximumMarks}</p>
            <p><strong>Grade:</strong> ${exam.grade}</p>
            <p><strong>Status:</strong> ${exam.status}</p>
            <p><strong>Exam Date:</strong> ${new Date(exam.examDate).toLocaleDateString()}</p>
          </div>
          <p>Keep up the good work!</p>
          <br>
          <p>Best regards,<br>Examination Department</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Exam result email sent to:', student.email);
  } catch (error) {
    console.error('Error sending exam result email:', error);
  }
};