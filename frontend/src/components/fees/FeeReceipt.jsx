import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PrinterIcon, DownloadIcon } from 'lucide-react';
import useFeeStore from '../../stores/feeStore';
import Loader from '../common/Loader';

const FeeReceipt = () => {
  const { id } = useParams();
  const { currentFee, loading, getFee } = useFeeStore();
  const [currentDate] = useState(new Date().toLocaleDateString());

  useEffect(() => {
    if (id) {
      getFee(id);
    }
  }, [id, getFee]);
    useEffect(() => {
    console.log('Current fee data in FeeReceipt:', currentFee);
  }, [currentFee]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Loader />;
  if (!currentFee) return <div>Receipt not found</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      {/* Printable Receipt */}
      <div className="print:bg-white print:p-0">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">College Name</h1>
          <p className="text-gray-600">Address Line 1, City, State - PIN Code</p>
          <p className="text-gray-600">Phone: +91 XXXXX XXXXX | Email: college@example.com</p>
          <h2 className="text-xl font-semibold text-blue-600 mt-2">FEE RECEIPT</h2>
        </div>

        {/* Receipt Details */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Information</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Name:</span> {currentFee.student?.firstName} {currentFee.student?.lastName}</p>
              <p><span className="font-medium">ID:</span> {currentFee.student?.studentId}</p>
              <p><span className="font-medium">Course:</span> {currentFee.student?.course}</p>
              <p><span className="font-medium">Semester:</span> {currentFee.semester}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Receipt Information</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Receipt No:</span> {currentFee.receiptNo}</p>
              <p><span className="font-medium">Date:</span> {new Date(currentFee.paymentDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Academic Year:</span> {currentFee.academicYear}</p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-1 px-2 py-1 text-xs font-semibold rounded-full ${
                  currentFee.status === 'paid' ? 'bg-green-100 text-green-800' :
                  currentFee.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {currentFee.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Fee Breakdown</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {currentFee.breakdown?.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{item.category}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{item.amount.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">Total Amount</td>
                <td className="border border-gray-300 px-4 py-2 text-right font-semibold">{currentFee.amount.toFixed(2)}</td>
              </tr>
              <tr className="bg-green-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">Paid Amount</td>
                <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-green-700">{currentFee.paidAmount.toFixed(2)}</td>
              </tr>
              {currentFee.balance > 0 && (
                <tr className="bg-yellow-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">Balance Due</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-yellow-700">{currentFee.balance.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Payment Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium">Payment Mode:</span> {currentFee.paymentMode}</p>
              {currentFee.transactionId && (
                <p><span className="font-medium">Transaction ID:</span> {currentFee.transactionId}</p>
              )}
            </div>
            <div>
              <p><span className="font-medium">Due Date:</span> {new Date(currentFee.dueDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Collected By:</span> {currentFee.collectedBy?.name}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="font-semibold">Student Signature</p>
              <div className="h-16 border-b border-gray-300 mt-2"></div>
            </div>
            <div className="text-center">
              <p className="font-semibold">Authorized Signature</p>
              <div className="h-16 border-b border-gray-300 mt-2"></div>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              This is a computer generated receipt and does not require a physical signature.
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
          <span>Print Receipt</span>
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

export default FeeReceipt;