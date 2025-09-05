import { useState } from "react";
import Notification from "../common/Notification";

const ProductTable = ({ products, onEdit, onDelete, categories }) => {
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await onDelete(id);
      } catch (error) {
        setDeleteError(error.message || "Failed to delete product");
      }
    }
  };

  const getCategoryName = (categoryId) => {
    console.log("categoryId:", categoryId); // Debug categoryId
    console.log("categories:", categories); // Debug categories
    if (typeof categoryId === "object" && categoryId?.categoryName) {
      return categoryId.categoryName; // ถ้า categoryId เป็น object จาก populate
    }
    const category = categories.find((c) => c._id === categoryId);
    return category ? category.categoryName : "-";
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      {deleteError && <Notification message={deleteError} type="error" />}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Product Code</th>
            <th className="p-2 text-left">Product Name</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">PV</th>
            <th className="p-2 text-left">Unit Price</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} className="border-b">
              <td className="p-2">{product.productCode}</td>
              <td className="p-2">{product.productName}</td>
              <td className="p-2">{getCategoryName(product.categoryId)}</td>
              <td className="p-2">{product.pv}</td>
              <td className="p-2">{product.unitPrice.toFixed(2)}</td>
              <td className="p-2">{product.status}</td>
              <td className="p-2">
                <button
                  onClick={() => {
                    console.log("Editing product:", product);
                    onEdit(product);
                  }}
                  className="bg-primary text-white px-2 py-1 rounded mr-2 hover:bg-primary-dark text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
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

export default ProductTable;
