import { useState, useEffect } from "react";
import Notification from "../common/Notification";

const ProductForm = ({
  onSubmit,
  initialData = {},
  categories = [],
  setError,
}) => {
  const [productCode, setProductCode] = useState(initialData.productCode || "");
  const [productName, setProductName] = useState(initialData.productName || "");
  const [categoryId, setCategoryId] = useState(initialData.categoryId || "");
  const [pv, setPv] = useState(initialData.pv || "");
  const [unitPrice, setUnitPrice] = useState(initialData.unitPrice || "");
  const [status, setStatus] = useState(initialData.status || "Active");

  useEffect(() => {
    console.log("initialData:", initialData);
    setProductCode(initialData.productCode || "");
    setProductName(initialData.productName || "");
    setCategoryId(initialData.categoryId || "");
    setPv(initialData.pv || "");
    setUnitPrice(initialData.unitPrice || "");
    setStatus(initialData.status || "Active");
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productCode || !productName || !categoryId || !pv || !unitPrice) {
      setError("All fields are required");
      return;
    }
    onSubmit({
      productCode,
      productName,
      categoryId,
      pv: Number(pv),
      unitPrice: Number(unitPrice),
      status,
    });
    if (!initialData._id) {
      setProductCode("");
      setProductName("");
      setCategoryId("");
      setPv("");
      setUnitPrice("");
      setStatus("Active");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow-md mb-6"
    >
      <h3 className="text-xl font-bold mb-4">
        {initialData._id ? "Edit Product" : "Add Product"}
      </h3>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm">Product Code</label>
        <input
          type="text"
          value={productCode}
          onChange={(e) => setProductCode(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:border-primary text-sm"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm">Product Name</label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:border-primary text-sm"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:border-primary text-sm"
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.categoryName}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm">PV</label>
        <input
          type="number"
          value={pv}
          onChange={(e) => setPv(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:border-primary text-sm"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm">Unit Price</label>
        <input
          type="number"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:border-primary text-sm"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:border-primary text-sm"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
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

export default ProductForm;
