// Example: backend/scripts/sendStudentRegistrationEmail.js
import { readFileSync } from 'fs';
import { join, dirname as _dirname } from 'path';
import { fileURLToPath } from 'url';
import sendMail from '../lib/mailSender.js';

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = _dirname(__filename);

// simple template renderer (safe for this use)
function renderTemplate(templatePath, vars) {
  let tpl = readFileSync(templatePath, 'utf8');
  for (const [k, v] of Object.entries(vars)) {
    const re = new RegExp(`{{\\s*${k}\\s*}}`, 'g');
    tpl = tpl.replace(re, String(v ?? ''));
  }
  return tpl;
}

async function sendStudentEmail(studentData) {
  const tplPath = join(__dirname, '..', 'templates', 'studentRegistration.html');

  const vars = {
    institutionName: 'CampusOne',
    institutionLogoUrl: '', // optional
    studentName: studentData?.name || '',
    course: studentData?.course || '',
    semester: studentData?.semester || '',
    rollNumber: studentData?.student_id || '',
    email: studentData?.email || '',
    signupUrl: 'https://campusone.example.com/signup',
    supportEmail: 'support@campusone.example.com',
    year: new Date().getFullYear(),
  };

    const html = renderTemplate(tplPath, vars);

    // send (to student email)
    const info = await sendMail(vars.email, html, 'Complete your CampusOne signup');
    console.log('Mail sent:', info?.messageId || info);
  }

  export default sendStudentEmail;