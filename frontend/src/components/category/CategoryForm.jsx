import { useState, useEffect } from "react";
import Notification from "../common/Notification";

const CategoryForm = ({ onSubmit, initialData = {}, setError }) => {
  const [categoryName, setCategoryName] = useState(
    initialData.categoryName || ""
  );
  const [description, setDescription] = useState(initialData.description || "");

  useEffect(() => {
    console.log("initialData:", initialData);
    setCategoryName(initialData.categoryName || "");
    setDescription(initialData.description || "");
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryName) {
      setError("Category Name is required");
      return;
    }
    onSubmit({ categoryName, description });
    if (!initialData._id) {
      setCategoryName("");
      setDescription("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow-md mb-6"
    >
      <h3 className="text-xl font-bold mb-4">
        {initialData._id ? "Edit Category" : "Add Category"}
      </h3>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm">Category Name</label>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:border-primary text-sm"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:border-primary text-sm"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-primary text-white p-2 rounded hover:bg-primary-dark text-sm"
      >
        {initialData._id ? "Update" : "Add"}
      </button>
    </form>
  );
};

export default CategoryForm;
