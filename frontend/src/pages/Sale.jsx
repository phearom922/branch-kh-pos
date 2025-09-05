import { useState, useEffect } from "react";
import axios from "axios";
import ProductSelection from "../components/sale/ProductSelection";
import SaleForm from "../components/sale/SaleForm";
import Notification from "../components/common/Notification";
import LoadingSpinner from "../components/common/LoadingSpinner";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Sale = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [memberName, setMemberName] = useState("");
  const [purchaseType, setPurchaseType] = useState("");

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleAddProduct = (product) => {
    const existingItemIndex = items.findIndex(
      (item) => item.productCode === product.productCode
    );
    if (existingItemIndex !== -1) {
      const newItems = [...items];
      newItems[existingItemIndex].amount += 1;
      newItems[existingItemIndex].totalPrice =
        newItems[existingItemIndex].unitPrice *
        newItems[existingItemIndex].amount;
      newItems[existingItemIndex].totalPV =
        newItems[existingItemIndex].pv * newItems[existingItemIndex].amount;
      setItems(newItems);
    } else {
      setItems([
        ...items,
        {
          productCode: product.productCode,
          productName: product.productName,
          unitPrice: product.unitPrice,
          pv: product.pv,
          amount: 1,
          totalPrice: product.unitPrice,
          totalPV: product.pv,
        },
      ]);
    }
  };

  const handleSubmit = async (saleData) => {
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/sales`, saleData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setItems([]);
      setMemberId("");
      setMemberName("");
      setPurchaseType("");
      setError("");
      return response.data.order; // ส่งคืนข้อมูล order ที่มี billNumber จริง
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save sale");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = memberId && memberName && purchaseType;

  console.log("isFormValid:", isFormValid, {
    memberId,
    memberName,
    purchaseType,
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-10/12 mx-auto">
        {/* {loading && <LoadingSpinner />} */}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/2">
            <ProductSelection
              onAddProduct={handleAddProduct}
              isFormValid={isFormValid}
            />
          </div>
          <div className="lg:w-1/2">
            <SaleForm
              items={items}
              setItems={setItems}
              onSubmit={handleSubmit}
              setError={setError}
              memberId={memberId}
              setMemberId={setMemberId}
              memberName={memberName}
              setMemberName={setMemberName}
              purchaseType={purchaseType}
              setPurchaseType={setPurchaseType}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Sale;
