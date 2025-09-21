import { useState, useEffect } from 'react';
import { PlusIcon, ReceiptIcon } from 'lucide-react';
import useFeeStore from '../../stores/feeStore';
import useStudentStore from '../../stores/studentStore';
import Table from '../common/Table';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import { useNavigate } from 'react-router-dom'; // Add this import


const FeeCollection = () => {
  const { fees, loading, pagination, filters, getFees, createFee, setFilters } = useFeeStore();
  const { students, getStudents } = useStudentStore();
  const [showFeeModal, setShowFeeModal] = useState(false);
  const navigate = useNavigate(); // Add this hook


  // ADD THESE TWO LINES HERE:
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState(null);

  const [formData, setFormData] = useState({
    studentId: '',
    academicYear: new Date().getFullYear().toString(),
    semester: 1,
    amount: 0,
    paidAmount: 0,
    dueDate: '',
    paymentMode: 'cash',
    transactionId: '',
    breakdown: [
      { category: 'Tuition Fee', amount: 0 },
      { category: 'Hostel Fee', amount: 0 },
      { category: 'Library Fee', amount: 0 },
      { category: 'Other Charges', amount: 0 }
    ]
  });


  useEffect(() => {
    getFees({ ...filters, page: 1 });
    getStudents({ limit: 100 });
  }, [filters]);

  // ADD THIS DEBUG HOOK:
  useEffect(() => {
    console.log('Fees from store:', fees);
    console.log('Pagination:', pagination);
  }, [fees, pagination]);
  useEffect(() => {
    getFees({ ...filters, page: 1 });
    getStudents({ limit: 100 }); // Fetch students for dropdown
  }, [filters]);

  const handlePageChange = (page) => {
    getFees({ ...filters, page });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBreakdownChange = (index, field, value) => {
    const updatedBreakdown = formData.breakdown.map((item, i) =>
      i === index ? { ...item, [field]: field === 'amount' ? parseFloat(value) || 0 : value } : item
    );

    const totalAmount = updatedBreakdown.reduce((sum, item) => sum + item.amount, 0);

    setFormData(prev => ({
      ...prev,
      breakdown: updatedBreakdown,
      amount: totalAmount
    }));
  };

  const generateReceiptNumber = () => {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `REC${timestamp}${random}`;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // KEEP the receiptNo generation for now
    const receiptData = {
      ...formData,
      receiptNo: generateReceiptNumber() // KEEP THIS LINE
    };
    
    console.log('Submitting fee:', receiptData);
    
    const createdFee = await createFee(receiptData);
    console.log('Created fee response:', createdFee);
    
    // Set the generated receipt and show the modal
    setGeneratedReceipt(createdFee);
    setShowReceiptModal(true);
    
    // Close the fee collection modal and reset form
    setShowFeeModal(false);
    setFormData({
      studentId: '',
      academicYear: new Date().getFullYear().toString(),
      semester: 1,
      amount: 0,
      paidAmount: 0,
      dueDate: '',
      paymentMode: 'cash',
      transactionId: '',
      breakdown: [
        { category: 'Tuition Fee', amount: 0 },
        { category: 'Hostel Fee', amount: 0 },
        { category: 'Library Fee', amount: 0 },
        { category: 'Other Charges', amount: 0 }
      ]
    });
    
  } catch (error) {
    console.error('Error creating fee:', error);
    alert('Failed to create fee: ' + error.message);
  }
};
  const columns = [
    {
      header: 'Receipt No',
      accessor: 'receiptNo'
    },
    {
      header: 'Student',
      accessor: 'student',
      render: (fee) => `${fee.student?.firstName} ${fee.student?.lastName} (${fee.student?.studentId})`
    },
    {
      header: 'Academic Year',
      accessor: 'academicYear'
    },
    {
      header: 'Semester',
      accessor: 'semester'
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (fee) => `₹${fee.amount}`
    },
    {
      header: 'Paid Amount',
      accessor: 'paidAmount',
      render: (fee) => `₹${fee.paidAmount}`
    },
    {
      header: 'Balance',
      accessor: 'balance',
      render: (fee) => `₹${fee.balance}`
    },
    {
      header: 'Payment Date',
      accessor: 'paymentDate',
      render: (fee) => new Date(fee.paymentDate).toLocaleDateString()
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (fee) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${fee.status === 'paid' ? 'bg-green-100 text-green-800' :
            fee.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              fee.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
          }`}>
          {fee.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600">Manage student fee payments</p>
        </div>
        <button
          onClick={() => setShowFeeModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Collect Fee</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Student ID</label>
            <input
              type="text"
              value={filters.studentId || ''}
              onChange={(e) => handleFilterChange({ studentId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter student ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange({ status: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange({ startDate: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange({ endDate: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fees Table */}
      <Table
        columns={columns}
        data={fees}
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
      />

      {/* Fee Collection Modal */}
      <Modal
        isOpen={showFeeModal}
        onClose={() => setShowFeeModal(false)}
        title="Collect Fee Payment"
        size="lg"
      >
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
                  <option key={student._id} value={student.studentId}>
                    {student.firstName} {student.lastName} ({student.studentId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Academic Year *</label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
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
              <label className="block text-sm font-medium text-gray-700">Due Date *</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Mode *</label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="For non-cash payments"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Total Amount</label>
              <input
                type="number"
                value={formData.amount}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Paid Amount *</label>
              <input
                type="number"
                name="paidAmount"
                value={formData.paidAmount}
                onChange={handleInputChange}
                required
                min="0"
                max={formData.amount}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fee Breakdown</label>
            <div className="space-y-2">
              {formData.breakdown.map((item, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={item.category}
                    onChange={(e) => handleBreakdownChange(index, 'category', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Category"
                  />
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleBreakdownChange(index, 'amount', e.target.value)}
                    className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Amount"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowFeeModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
            >
              <ReceiptIcon className="h-4 w-4" />
              <span>Generate Receipt</span>
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Fee Receipt"
        size="lg"
      >
        {generatedReceipt && (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Receipt Generated Successfully!</h3>
            <p><strong>Receipt No:</strong> {generatedReceipt.receiptNo}</p>
            <p><strong>Student:</strong> {generatedReceipt.student?.firstName} {generatedReceipt.student?.lastName}</p>
            <p><strong>Amount:</strong> ₹{generatedReceipt.amount}</p>
            <p><strong>Status:</strong> {generatedReceipt.status}</p>

            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => navigate(`/fees/receipt/${generatedReceipt._id}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                View Full Receipt
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="border border-gray-300 px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FeeCollection;