import { useState } from "react";
import Notification from "../common/Notification";

const CategoryTable = ({ categories, onEdit, onDelete }) => {
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await onDelete(id);
      } catch (error) {
        setDeleteError(error.message || "Failed to delete category");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      {deleteError && <Notification message={deleteError} type="error" />}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Category Name</th>
            <th className="p-2 text-left">Description</th>
            <th className="p-2 text-left">Created Date</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category._id} className="border-b">
              <td className="p-2">{category.categoryName}</td>
              <td className="p-2">{category.description || "-"}</td>
              <td className="p-2">
                {new Date(category.createdAt).toLocaleDateString()}
              </td>
              <td className="p-2">
                <button
                  onClick={() => {
                    console.log("Editing category:", category);
                    onEdit(category);
                  }}
                  className="bg-primary text-white px-2 py-1 rounded mr-2 hover:bg-primary-dark text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
