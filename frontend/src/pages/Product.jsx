import { useState, useEffect } from "react";
import axios from "axios";
import Notification from "../components/common/Notification";
import LoadingSpinner from "../components/common/LoadingSpinner";
import * as XLSX from "xlsx";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Product = () => {
  const [filterCategories, setFilterCategories] = useState([]);
  // ฟีเจอร์ใหม่
  const [searchCode, setSearchCode] = useState("");
  const [searchName, setSearchName] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productCode, setProductCode] = useState("");
  const [productName, setProductName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pv, setPv] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("Active");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (groupId) {
      fetchCategories();
    } else {
      setCategories([]);
      setCategoryId("");
    }
  }, [groupId]);

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
        params: { groupId },
      });
      setCategories(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterCategories = async (groupId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { groupId },
      });
      setFilterCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch filter categories", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { all: true, limit: 0 }, // เพิ่ม limit: 0 เพื่อดึงทั้งหมด
      });
      setProducts(response.data.products);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/products`,
        {
          productCode,
          productName,
          groupId,
          categoryId,
          pv: Number(pv),
          unitPrice: Number(unitPrice),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setProducts([...products, response.data]);
      setSuccess("Product created successfully");
      resetForm();
      setShowProductModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create product");
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/products/${editingId}`,
        {
          productCode,
          productName,
          groupId,
          categoryId,
          pv: Number(pv),
          unitPrice: Number(unitPrice),
          status,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setProducts(
        products.map((p) => (p._id === editingId ? response.data : p))
      );
      setSuccess("Product updated successfully");
      resetForm();
      setShowProductModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setError("");
      setSuccess("");
      try {
        await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProducts(products.filter((p) => p._id !== id));
        setSuccess("Product deleted successfully");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete product");
      }
    }
  };

  const openProductModal = (product = null) => {
    if (product) {
      setEditingId(product._id);
      setProductCode(product.productCode);
      setProductName(product.productName);
      setGroupId(product.groupId?._id || "");
      setCategoryId(product.categoryId?._id || "");
      setPv(product.pv);
      setUnitPrice(product.unitPrice);
      setStatus(product.status);
      if (product.groupId?._id) {
        fetchCategories();
      }
    } else {
      resetForm();
    }
    setShowProductModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setProductCode("");
    setProductName("");
    setGroupId("");
    setCategoryId("");
    setPv("");
    setUnitPrice("");
    setStatus("Active");
  };

  const closeModal = () => {
    setShowProductModal(false);
    resetForm();
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError("กรุณาเลือกไฟล์ Excel");
      return;
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setError("ไฟล์ต้องเป็นนามสกุล .xlsx หรือ .xls");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_BASE_URL}/api/products/import`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { imported, skippedRows, errors } = response.data;
      if (errors && errors.length > 0) {
        setSuccess(
          `✅ Import finished goods: Import ${imported} List, skip ${skippedRows} row: ${errors
            .map((e) => `row ${e.i}: ${e.error}`)
            .join(", ")}`
        );
      } else {
        setSuccess(
          `✅ Import finished goods: Import ${imported} List, skip ${skippedRows} row`
        );
      }
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Import failed");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-10/12 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Product management
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => openProductModal()}
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
              Add Products
            </button>
            <button
              onClick={() => document.getElementById("excelInput").click()}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200 text-sm font-medium"
            >
              Import Excel
            </button>
            <button
              onClick={() => {
                const templateData = [
                  {
                    productCode: "ABC123",
                    productName: "สินค้า A",
                    groupName: "กลุ่ม1",
                    categoryName: "หมวด1",
                    pv: 10,
                    unitPrice: 100.0,
                  },
                  {
                    productCode: "XYZ789",
                    productName: "สินค้า B",
                    groupName: "กลุ่ม2",
                    categoryName: "หมวด2",
                    pv: 20,
                    unitPrice: 200.0,
                  },
                ];
                const ws = XLSX.utils.json_to_sheet(templateData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Template");
                XLSX.writeFile(wb, "product_import_template.xlsx");
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200 text-sm font-medium"
            >
              Download Excel template
            </button>
            <input
              id="excelInput"
              type="file"
              accept=".xlsx, .xls"
              style={{ display: "none" }}
              onChange={handleImportExcel}
            />
          </div>
        </div>

        {error && <Notification message={error} type="error" />}
        {success && <Notification message={success} type="success" />}
        {loading && <LoadingSpinner />}

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Search Product Code"
                value={searchCode}
                onChange={(e) => {
                  setSearchCode(e.target.value);
                  setCurrentPage(1);
                }}
                className="p-2 border rounded text-sm"
              />
              <input
                type="text"
                placeholder="Search Product Name"
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setCurrentPage(1);
                }}
                className="p-2 border rounded text-sm"
              />
              <select
                value={filterGroup}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterGroup(value);
                  setFilterCategory("");
                  setCurrentPage(1);
                  if (value) {
                    fetchFilterCategories(value); // ✅ ดึง categories สำหรับ filter
                  } else {
                    setFilterCategories([]); // เคลียร์เมื่อเลือก All Groups
                  }
                }}
                className="p-2 border rounded text-sm"
              >
                <option value="">All Groups</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.groupName}
                  </option>
                ))}
              </select>

              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="p-2 border rounded text-sm"
                disabled={!filterGroup}
              >
                <option value="">All Categories</option>
                {filterCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {products.length} items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="p-3">Product Code</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Group</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">PV</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(() => {
                  // filter
                  let filtered = products.filter((p) => {
                    const codeMatch = p.productCode
                      .toLowerCase()
                      .includes(searchCode.toLowerCase());
                    const nameMatch = p.productName
                      .toLowerCase()
                      .includes(searchName.toLowerCase());
                    const groupMatch =
                      !filterGroup || p.groupId?._id === filterGroup;
                    const catMatch =
                      !filterCategory || p.categoryId?._id === filterCategory;
                    return codeMatch && nameMatch && groupMatch && catMatch;
                  });
                  // pagination
                  const totalPages = Math.ceil(filtered.length / itemsPerPage);
                  const startIdx = (currentPage - 1) * itemsPerPage;
                  const pageItems = filtered.slice(
                    startIdx,
                    startIdx + itemsPerPage
                  );
                  return pageItems.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{product.productCode}</td>
                      <td className="p-3">{product.productName}</td>
                      <td className="p-3">
                        {product.groupId?.groupName || "-"}
                      </td>
                      <td className="p-3">
                        {product.categoryId?.categoryName || "-"}
                      </td>
                      <td className="p-3">{product.pv}</td>
                      <td className="p-3">{product.unitPrice.toFixed(2)}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            product.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openProductModal(product)}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-200 transition duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
            {/* Pagination UI */}
            <div className="flex justify-center items-center mt-4 gap-2">
              {(() => {
                let filtered = products.filter((p) => {
                  const codeMatch = p.productCode
                    .toLowerCase()
                    .includes(searchCode.toLowerCase());
                  const nameMatch = p.productName
                    .toLowerCase()
                    .includes(searchName.toLowerCase());
                  const groupMatch =
                    !filterGroup || p.groupId?._id === filterGroup;
                  const catMatch =
                    !filterCategory || p.categoryId?._id === filterCategory;
                  return codeMatch && nameMatch && groupMatch && catMatch;
                });
                const totalPages = Math.ceil(filtered.length / itemsPerPage);
                if (totalPages <= 1) return null;
                let pages = [];
                let start = Math.max(1, currentPage - 2);
                let end = Math.min(totalPages, currentPage + 2);
                if (start > 1)
                  pages.push(
                    <button
                      key="first"
                      onClick={() => setCurrentPage(1)}
                      className="px-2 py-1"
                    >
                      1
                    </button>
                  );
                if (start > 2) pages.push(<span key="dots1">...</span>);
                for (let i = start; i <= end; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-1 rounded ${
                        i === currentPage
                          ? "bg-orange-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                if (end < totalPages - 1)
                  pages.push(<span key="dots2">...</span>);
                if (end < totalPages)
                  pages.push(
                    <button
                      key="last"
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-2 py-1"
                    >
                      {totalPages}
                    </button>
                  );
                return <>{pages}</>;
              })()}
            </div>
          </div>
        </div>

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0  bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b border-gray-300 sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingId ? "Edit Product" : "Add Product"}
                </h3>
                <button
                  onClick={closeModal}
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
                onSubmit={editingId ? handleUpdateProduct : handleCreateProduct}
                className="p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Group
                    </label>
                    <select
                      value={groupId}
                      onChange={(e) => {
                        setGroupId(e.target.value);
                        setCategoryId("");
                      }}
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
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                      disabled={!groupId}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Product Code
                    </label>
                    <input
                      type="text"
                      value={productCode}
                      onChange={(e) => setProductCode(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      PV
                    </label>
                    <input
                      type="number"
                      value={pv}
                      onChange={(e) => setPv(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                      min="0"
                      step="0.01"
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
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-300 mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition duration-200"
                  >
                    {editingId ? "Update Product" : "Create Product"}
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

export default Product;
