// backend/scripts/sendFeeReceipt.js
import { readFileSync } from 'fs';
import { join, dirname as _dirname } from 'path';
import { fileURLToPath } from 'url';
import sendMail from '../lib/mailSender.js';

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = _dirname(__filename);

// simple template renderer
function renderTemplate(templatePath, vars) {
  let tpl = readFileSync(templatePath, 'utf8');

  for (const [key, value] of Object.entries(vars)) {
    const re = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    tpl = tpl.replace(re, String(value ?? ''));
  }

  return tpl;
}

async function sendFeeReceipt(toEmail, fee) {
  if (!toEmail) throw new Error('Student email missing');
  if (!fee) throw new Error('Fee data missing');

  const tplPath = join(__dirname, '..', 'templates', 'studentFeeSubmission.html');

  const vars = {
    receiptNo: fee.receiptNo,
    studentName: `${fee.student.firstName} ${fee.student.lastName}`,
    studentId: fee.student.studentId,
    semester: fee.semester,
    amount: fee.amount,
    paidAmount: fee.paidAmount,
    balance: fee.balance,
    paymentMode: fee.paymentMode,
    status: fee.status,
    paymentDate: new Date(fee.paymentDate).toLocaleDateString(),
  };

  const html = renderTemplate(tplPath, vars);

  const info = await sendMail(
    toEmail,
    html,
    `Fee Receipt - ${fee.receiptNo}`
  );

  console.log('Fee receipt email sent:', info?.messageId || info);
}

export default sendFeeReceipt;
