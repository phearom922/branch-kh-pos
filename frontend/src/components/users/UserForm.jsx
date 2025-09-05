// UserForm.jsx
import { useState, useEffect } from "react";
import Notification from "../common/Notification";

const UserForm = ({ onSubmit, initialData = {}, branches = [], setError }) => {
  const [username, setUsername] = useState(initialData.username || "");
  const [lastName, setLastName] = useState(initialData.lastName || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialData.role || "Admin");
  const [branchCode, setBranchCode] = useState(initialData.branchCode || "");
  const [status, setStatus] = useState(initialData.status || "Active");

  useEffect(() => {
    setUsername(initialData.username || "");
    setLastName(initialData.lastName || "");
    setPassword("");
    setRole(initialData.role || "Admin");
    setBranchCode(initialData.branchCode || "");
    setStatus(initialData.status || "Active");
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !username ||
      !lastName ||
      !role ||
      !branchCode ||
      (!initialData._id && !password)
    ) {
      setError("All fields are required");
      return;
    }
    onSubmit({ username, lastName, password, role, branchCode, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          required
          placeholder="Enter username"
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Last Name
        </label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          required
          placeholder="Enter last name"
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Password {!initialData._id && <span className="text-red-500">*</span>}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          required={!initialData._id}
          placeholder={
            initialData._id
              ? "Leave blank to keep current password"
              : "Enter password"
          }
        />
        {initialData._id && (
          <p className="text-xs text-gray-500 mt-1">
            Leave blank to keep current password
          </p>
        )}
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        >
          <option value="Admin">Admin</option>
          <option value="Cashier">Cashier</option>
        </select>
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Branch
        </label>
        <select
          value={branchCode}
          onChange={(e) => setBranchCode(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        >
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch._id} value={branch.branchCode}>
              {branch.branchCode} - {branch.branchName}
            </option>
          ))}
        </select>
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
        className="w-full bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600 transition duration-200 text-sm font-medium"
      >
        {initialData._id ? "Update User" : "Add User"}
      </button>
    </form>
  );
};

export default UserForm;
