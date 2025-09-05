import { useState, useEffect } from "react";
import axios from "axios";
import Notification from "../components/common/Notification";
import LoadingSpinner from "../components/common/LoadingSpinner";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("Active");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/groups`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGroups(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCategories(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/groups`,
        { groupName },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setGroups([...groups, response.data]);
      setSuccess("Group created successfully");
      setGroupName("");
      setShowGroupModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group");
    }
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/groups/${editingGroupId}`,
        { groupName, status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setGroups(
        groups.map((g) => (g._id === editingGroupId ? response.data : g))
      );
      setSuccess("Group updated successfully");
      setGroupName("");
      setEditingGroupId(null);
      setStatus("Active");
      setShowGroupModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update group");
    }
  };

  const handleDeleteGroup = async (id) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      setError("");
      setSuccess("");
      try {
        await axios.delete(`${API_BASE_URL}/api/groups/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setGroups(groups.filter((g) => g._id !== id));
        setSuccess("Group deleted successfully");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete group");
      }
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/categories`,
        { categoryName, groupId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setCategories([...categories, response.data]);
      setSuccess("Category created successfully");
      setCategoryName("");
      setGroupId("");
      setShowCategoryModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create category");
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/categories/${editingId}`,
        { categoryName, groupId, status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setCategories(
        categories.map((c) => (c._id === editingId ? response.data : c))
      );
      setSuccess("Category updated successfully");
      setCategoryName("");
      setGroupId("");
      setEditingId(null);
      setStatus("Active");
      setShowCategoryModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setError("");
      setSuccess("");
      try {
        await axios.delete(`${API_BASE_URL}/api/categories/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCategories(categories.filter((c) => c._id !== id));
        setSuccess("Category deleted successfully");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete category");
      }
    }
  };

  const openGroupModal = (group = null) => {
    if (group) {
      setEditingGroupId(group._id);
      setGroupName(group.groupName);
      setStatus(group.status);
    } else {
      setEditingGroupId(null);
      setGroupName("");
      setStatus("Active");
    }
    setShowGroupModal(true);
  };

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingId(category._id);
      setCategoryName(category.categoryName);
      setGroupId(category.groupId?._id || "");
      setStatus(category.status);
    } else {
      setEditingId(null);
      setCategoryName("");
      setGroupId("");
      setStatus("Active");
    }
    setShowCategoryModal(true);
  };

  const closeModals = () => {
    setShowGroupModal(false);
    setShowCategoryModal(false);
    setEditingGroupId(null);
    setEditingId(null);
    setGroupName("");
    setCategoryName("");
    setGroupId("");
    setStatus("Active");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-10/12 mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Category Management
        </h2>
        {error && <Notification message={error} type="error" />}
        {success && <Notification message={success} type="success" />}
        {loading && <LoadingSpinner />}

        {/* Add Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => openGroupModal()}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition duration-200 text-sm font-medium flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Group
          </button>
          <button
            onClick={() => openCategoryModal()}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 text-sm font-medium flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Category
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Groups */}
          <div className="space-y-6">
            {/* Group Table */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Groups</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {groups.length} items
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="p-3">Group Name</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {groups.map((group) => (
                      <tr key={group._id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium">{group.groupName}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              group.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {group.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openGroupModal(group)}
                              className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition duration-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteGroup(group._id)}
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
            </div>
          </div>

          {/* Right Column - Categories */}
          <div className="space-y-6">
            {/* Category Table */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Categories</h3>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {categories.length} items
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="p-3">Group</th>
                      <th className="p-3">Category Name</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categories.map((category) => (
                      <tr key={category._id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium">
                          {category.groupId?.groupName || "-"}
                        </td>
                        <td className="p-3">{category.categoryName}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              category.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {category.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openCategoryModal(category)}
                              className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition duration-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
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
            </div>
          </div>
        </div>

        {/* Group Modal */}
        {showGroupModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-primary">
                <h3 className="text-xl font-bold text-white">
                  {editingGroupId ? "Edit Group" : "Add Group"}
                </h3>
                <button
                  onClick={closeModals}
                  className="text-white p-1 hover:bg-orange-400 rounded"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form
                onSubmit={
                  editingGroupId ? handleUpdateGroup : handleCreateGroup
                }
                className="p-4"
              >
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                {editingGroupId && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                )}
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition duration-200"
                  >
                    {editingGroupId ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingId ? "Edit Category" : "Add Category"}
                </h3>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form
                onSubmit={
                  editingId ? handleUpdateCategory : handleCreateCategory
                }
                className="p-4"
              >
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Group
                  </label>
                  <select
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Select Group</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.groupName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                {editingId && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                )}
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-200"
                  >
                    {editingId ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
