// BranchForm.jsx
import { useState, useEffect } from "react";
import Notification from "../common/Notification";

const BranchForm = ({ onSubmit, initialData = {}, setError }) => {
  const [branchCode, setBranchCode] = useState(initialData.branchCode || "");
  const [branchName, setBranchName] = useState(initialData.branchName || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [status, setStatus] = useState(initialData.status || "Active");

  useEffect(() => {
    setBranchCode(initialData.branchCode || "");
    setBranchName(initialData.branchName || "");
    setAddress(initialData.address || "");
    setStatus(initialData.status || "Active");
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!branchCode || !branchName || !address) {
      setError("All fields are required");
      return;
    }
    onSubmit({ branchCode, branchName, address, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Branch Code
        </label>
        <input
          type="text"
          value={branchCode}
          onChange={(e) => setBranchCode(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          required
          placeholder="Enter branch code"
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Branch Name
        </label>
        <input
          type="text"
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          required
          placeholder="Enter branch name"
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Address
        </label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          required
          rows={3}
          placeholder="Enter branch address"
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-orange-500 text-white p-3 rounded-md hover:bg-orange-600 transition duration-200 text-sm font-medium"
      >
        {initialData._id ? "Update Branch" : "Add Branch"}
      </button>
    </form>
  );
};

export default BranchForm;
