// BranchTable.jsx
import { useState } from "react";
import Notification from "../common/Notification";

const BranchTable = ({ branches, onEdit, onDelete }) => {
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        await onDelete(id);
      } catch (error) {
        setDeleteError(error.message || "Failed to delete branch");
      }
    }
  };

  return (
    <div>
      {deleteError && <Notification message={deleteError} type="error" />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="p-3">Branch Code</th>
              <th className="p-3">Branch Name</th>
              <th className="p-3">Address</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {branches.map((branch) => (
              <tr
                key={branch._id}
                className="hover:bg-gray-50 transition duration-150"
              >
                <td className="p-3 font-medium">{branch.branchCode}</td>
                <td className="p-3">{branch.branchName}</td>
                <td className="p-3 text-gray-600 max-w-xs truncate">
                  {branch.address}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      branch.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {branch.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(branch)}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(branch._id)}
                      className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-200 transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {branches.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No branches found. Click "Add Branch" to create one.
        </div>
      )}
    </div>
  );
};

export default BranchTable;