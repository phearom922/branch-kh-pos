import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { generateInvoicePDF } from "../../utils/pdfGenerator";
import { PiPrinterLight } from "react-icons/pi";
import { ToastContainer, toast } from "react-toastify";

const SaleForm = ({
  items,
  setItems,
  onSubmit,
  setError,
  memberId,
  setMemberId,
  memberName,
  setMemberName,
  purchaseType,
  setPurchaseType,
}) => {
  const { user } = useContext(AuthContext);
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [billData, setBillData] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // เพิ่ม state สำหรับ loading

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleAmountChange = (index, amount) => {
    const newItems = [...items];
    newItems[index].amount = Number(amount);
    newItems[index].totalPrice = newItems[index].unitPrice * amount;
    newItems[index].totalPV = newItems[index].pv * amount;
    setItems(newItems);
  };

  const handleDeleteItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalPV = items.reduce((sum, item) => sum + item.totalPV, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!memberId || !memberName || !purchaseType || items.length === 0) {
      setError("All fields are required");
      return;
    }

    setIsLoading(true); // เริ่มต้นสถานะ loading

    const bill = {
      memberId,
      memberName,
      purchaseType,
      items,
      totalPrice,
      totalPV,
      createdAt: new Date(),
      recordBy: user.username || "N/A",
    };

    try {
      const savedBill = await onSubmit(bill); // รอรับข้อมูลจาก backend
      if (savedBill) {
        toast.success("Sale created successfully");
        setBillData(savedBill); // ใช้ข้อมูลจาก backend ที่มี billNumber จริง
        setIsModalOpen(true);
        // generateInvoicePDF(savedBill, user); // ใช้ savedBill แทน billData
        setMemberId("");
        setMemberName("");
        setPurchaseType("");
        setItems([]);
        setSuccess("Sale created successfully");
      }
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Failed to save order");
    } finally {
      setIsLoading(false); // สิ้นสุดสถานะ loading
    }
  };

  const viewPdfAndClose = () => {
    generateInvoicePDF(billData, user); // ✅ ใช้ฟังก์ชันจาก utils
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold mb-6 text-gray-700 border-b border-gray-300 pb-3">
        Sale Details
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Member Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Member ID
            </label>
            <input
              type="text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full p-2 border border-gray-300 text-primary font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition duration-200"
              required
              placeholder="Enter member ID"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Member Name
            </label>
            <input
              type="text"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              className="w-full p-2 border border-gray-300 text-primary font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition duration-200"
              required
              placeholder="Enter member name"
            />
          </div>
        </div>

        {/* Purchase Type */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-gray-700 text-sm font-medium mb-3">
            Purchase Type
          </label>
          <div className="flex space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  name="purchaseType"
                  value="CMC"
                  checked={purchaseType === "CMC"}
                  onChange={(e) => setPurchaseType(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition duration-200 ${
                    purchaseType === "CMC"
                      ? "border-orange-500 bg-orange-500"
                      : "border-gray-400"
                  }`}
                >
                  {purchaseType === "CMC" && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
              <span className="text-gray-700 font-medium">CMC</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  name="purchaseType"
                  value="STK"
                  checked={purchaseType === "STK"}
                  onChange={(e) => setPurchaseType(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition duration-200 ${
                    purchaseType === "STK"
                      ? "border-orange-500 bg-orange-500"
                      : "border-gray-400"
                  }`}
                >
                  {purchaseType === "STK" && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
              <span className="text-gray-700 font-medium">STK</span>
            </label>
          </div>
        </div>

        {/* Items Table */}
        {items.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 border-b border-orange-200">
              <h4 className="text-lg font-semibold text-gray-800">
                Order Items
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    <th className="p-3">Product</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">PV</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Total PV</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-3 py-1">
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.productCode}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.productName}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-medium">
                        {item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-3 py-1">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          {item.pv}
                        </span>
                      </td>
                      <td className="px-3 py-1">
                        <input
                          type="number"
                          min="1"
                          value={item.amount}
                          onChange={(e) =>
                            handleAmountChange(index, e.target.value)
                          }
                          className="w-16 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent text-center transition duration-200"
                        />
                      </td>
                      <td className="px-3 py-1 font-medium text-green-700">
                        {item.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-3 py-1">
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                          {item.totalPV}
                        </span>
                      </td>
                      <td className="px-3 py-1">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(index)}
                          className="bg-red-100 text-red-700 px-2 py-2 cursor-pointer rounded-md hover:bg-red-200 transition duration-200 flex items-center"
                        >
                          <svg
                            className="w-4 h-4 "
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Totals */}
        {items.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 font-medium">
                  Total Price
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {totalPrice.toFixed(2)}
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 font-medium">
                  Total PV
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {totalPV}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button with Loading State */}
        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition duration-200 flex items-center justify-center ${
            items.length === 0 || isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-500 cursor-pointer to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          }`}
          disabled={items.length === 0 || isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            "Save Order"
          )}
        </button>
      </form>

      {/* Modal */}
      {isModalOpen && billData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4 text-gray-600">
              The purchase order has been Successfully saved.
            </h2>
            <div className="flex justify-end space-x-3">
              <button
                onClick={viewPdfAndClose}
                className="bg-orange-500 text-white cursor-pointer px-4 py-2 flex justify-center items-center gap-2 rounded hover:bg-orange-600"
              >
                <PiPrinterLight className="text-xl" />
                Print Invoice
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-800 cursor-pointer px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};
export default SaleForm;
