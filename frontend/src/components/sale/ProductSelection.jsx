import { useState, useEffect, useCallback, memo } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import Notification from "../common/Notification";
import LoadingSpinner from "../common/LoadingSpinner";

// --- Helper Icons ---
const SearchIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PlusCircleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const ChevronLeftIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// --- Sub-component: Group Tab ---
const GroupTab = memo(({ group, currentGroupId, onSelect, isDisabled }) => (
  <button
    onClick={() => onSelect(group._id)}
    className={`px-3 py-1.5 text-[12px] cursor-pointer w-full font-medium rounded-t-md transition-colors duration-200 ease-in-out whitespace-nowrap
        ${
          currentGroupId === group._id
            ? "bg-primary text-white shadow "
            : "bg-gray-200 text-gray-700 hover:ring-1 hover:ring-orange-300 hover:bg-orange-100"
        }`}
    disabled={isDisabled}
  >
    {group.groupName}
  </button>
));

// --- Sub-component: Category Pill ---
const CategoryPill = memo(
  ({ category, currentCategoryId, onSelect, isDisabled }) => (
    <button
      onClick={() => onSelect(category._id)}
      className={`px-3 py-1.5 text-[12px] font-medium cursor-pointer rounded-md transition-colors duration-200 ease-in-out whitespace-nowrap
        ${
          currentCategoryId === category._id
            ? "bg-primary text-white shadow"
            : "bg-gray-50 text-gray-700 ring-1 ring-orange-300 hover:bg-orange-100"
        }`}
      disabled={isDisabled}
    >
      {category.categoryName}
    </button>
  )
);

// --- Sub-component: Product Table Row ---
const ProductTableRow = memo(
  ({ product, onAddProduct, isFormValid, index, page, limit }) => (
    <tr
      className={`border-b border-gray-200 ${
        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
      } hover:bg-blue-50`}
    >
      {/* <td className="p-2 text-sm text-gray-600">
        {(page - 1) * limit + index + 1}
      </td> */}
      <td className="p-2 text-xs font-semibold text-left text-gray-600">
        {product.productCode}
      </td>
      <td className="p-2 text-xs font-semibold text-gray-600">
        {product.categoryId?.categoryName.split(":")[1] || "-"}
      </td>
      <td
        className="p-2 text-xs font-semibold text-left text-gray-800 max-w-[200px] truncate"
        title={product.productName}
      >
        {product.productName}
      </td>
      <td className="p-2 text-xs font-semibold text-gray-600 text-right">
        {product.pv}
      </td>
      <td className="p-2 text-xs font-semibold text-gray-600 text-right">
        {product.unitPrice.toFixed(2)}
      </td>
      <td className="p-2 text-center flex justify-center">
        <button
          onClick={() => onAddProduct(product)}
          className="disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          disabled={!isFormValid}
          title="Add product"
        >
          <PlusCircleIcon className="w-5 h-5 rounded-full text-orange-500 hover:text-white hover:bg-orange-500 hover:cursor-pointer" />
        </button>
      </td>
    </tr>
  )
);

// --- Sub-component: Pagination Controls ---
const Pagination = memo(
  ({ currentPage, totalPages, onPageChange, isDisabled }) => {
    if (totalPages <= 1) return null;
    const getPaginationGroup = () => {
      const pages = [];
      const maxPagesToShow = 5;
      const pageNeighbours = Math.floor((maxPagesToShow - 2) / 2);
      if (totalPages <= maxPagesToShow + 2) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const startPage = Math.max(2, currentPage - pageNeighbours);
        const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);
        pages.push(1);
        if (startPage > 2) pages.push("...");
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        if (endPage < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
      return pages;
    };
    const pageNumbers = getPaginationGroup();
    const PageButton = ({ page, children }) => {
      const isCurrent = page === currentPage;
      return (
        <button
          onClick={() => onPageChange(page)}
          disabled={isDisabled}
          className={`flex items-center justify-center w-6 h-6 rounded-md transition-colors
            ${
              isCurrent
                ? "bg-primary text-white font-bold shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100 border cursor-pointer border-gray-200"
            }
            ${
              isDisabled
                ? "disabled:opacity-50 disabled:cursor-not-allowed"
                : ""
            }`}
        >
          {children}
        </button>
      );
    };
    return (
      <nav className="flex items-center justify-center gap-2 mt-6 text-sm">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isDisabled}
          className="flex items-center justify-center w-6 h-6 bg-white text-gray-700 cursor-pointer hover:bg-gray-100 border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous Page"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="flex items-center justify-center w-9 h-9  text-gray-500"
            >
              ...
            </span>
          ) : (
            <PageButton key={page} page={page}>
              {page}
            </PageButton>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isDisabled}
          className="flex items-center justify-center w-6 h-6 bg-white text-gray-700 cursor-pointer hover:bg-gray-100 border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next Page"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </nav>
    );
  }
);

// --- Main Component: ProductSelection ---
const ProductSelection = ({ onAddProduct, isFormValid }) => {
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [groupId, setGroupId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(true);
  const limit = 15; // ลดจำนวนแถวต่อหน้า
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 5000);
  };

  const fetchGroups = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/groups`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const sortedGroups = response.data.sort((a, b) => {
        const numA = parseInt(a.groupName.split(":")[0]) || 9999;
        const numB = parseInt(b.groupName.split(":")[0]) || 9999;
        return numA - numB;
      });
      console.log("Fetched groups:", sortedGroups);
      setGroups(sortedGroups);
      if (sortedGroups.length > 0) {
        setGroupId(sortedGroups[0]._id.toString());
      } else {
        setLoading(false);
        showNotification("No groups available");
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to fetch groups");
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    if (!groupId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { groupId },
      });
      console.log("Fetched categories for groupId:", groupId, response.data);
      setCategories(response.data);
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to fetch categories"
      );
    }
  }, [groupId]);

  const fetchProducts = useCallback(
    async (currentPage, currentSearch, currentGroupId, currentCategoryId) => {
      if (!currentGroupId) {
        setProducts([]);
        setTotal(0);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/sales/products`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: {
            search: currentSearch,
            page: currentPage,
            limit,
            groupId: currentGroupId,
            categoryId: currentCategoryId === "" ? null : currentCategoryId,
            status: "Active", // กรองเฉพาะสินค้า Active
          },
        });
        console.log(
          "Fetched products for groupId:",
          currentGroupId,
          "categoryId:",
          currentCategoryId,
          "Response:",
          response.data
        );
        const invalidProducts = response.data.products.filter((p) => {
          const groupIdStr =
            typeof p.groupId === "string"
              ? p.groupId
              : p.groupId?._id?.toString();
          return groupIdStr !== currentGroupId;
        });
        if (invalidProducts.length > 0) {
          console.warn(
            "Warning: Products from different groupId found:",
            invalidProducts
          );
        }
        if (response.data.products.length !== response.data.total) {
          console.warn(
            "Mismatch: products length",
            response.data.products.length,
            "vs total",
            response.data.total
          );
        }
        setProducts(response.data.products);
        setTotal(response.data.total);
      } catch (err) {
        showNotification(
          err.response?.data?.message || "Failed to fetch products"
        );
        setProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchGroups().then(() => {
      if (groupId) {
        fetchCategories();
        fetchProducts(page, search, groupId, categoryId);
      }
    });
  }, []);

  useEffect(() => {
    if (groupId) {
      fetchCategories();
      fetchProducts(page, search, groupId, categoryId);
    } else {
      setCategories([]);
      setProducts([]);
      setTotal(0);
    }
  }, [groupId, page, search, categoryId, fetchCategories, fetchProducts]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setPage(1);
      setSearch(value);
    }, 300),
    []
  );

  const handleGroupFilter = (id) => {
    setPage(1);
    setGroupId(id.toString());
    setCategoryId("");
    console.log("Selected groupId:", id.toString());
  };

  const handleCategoryFilter = (id) => {
    setPage(1);
    setCategoryId(id);
    console.log("Selected categoryId:", id);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div
      className={`bg-white p-4 sm:p-6 rounded-lg shadow-lg transition-opacity duration-300 ${
        !isFormValid ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">Select Products</h3>
      {notification.message && (
        <Notification message={notification.message} type={notification.type} />
      )}
      {/* --- Filter Controls --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-3 relative lg:col-span-3">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            onChange={(e) => debouncedSearch(e.target.value)}
            placeholder="Search by SKU or Product Name..."
            className="w-full pl-10 pr-4 py-2 focus:border-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff7100] text-sm"
            disabled={!isFormValid}
          />
        </div>
      </div>
      {/* --- Group Tabs --- */}
      <div className="flex items-center  mb-4 gap-1  border-gray-200 ">
        {groups.length > 0 ? (
          groups.map((group) => (
            <GroupTab
              key={group._id}
              group={group}
              currentGroupId={groupId}
              onSelect={handleGroupFilter}
              isDisabled={!isFormValid}
            />
          ))
        ) : (
          <span className="text-gray-500">No groups available</span>
        )}
      </div>
      {/* --- Category Pills --- */}
      <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-gray-200">
        {groupId && (
          <>
            <CategoryPill
              category={{ _id: "", categoryName: "All Categories" }}
              currentCategoryId={categoryId}
              onSelect={handleCategoryFilter}
              isDisabled={!isFormValid}
            />
            {categories
              .filter(
                (cat) => cat.groupId?._id === groupId || cat.groupId === groupId
              )
              .map((cat) => (
                <CategoryPill
                  key={cat._id}
                  category={cat}
                  currentCategoryId={categoryId}
                  onSelect={handleCategoryFilter}
                  isDisabled={!isFormValid}
                />
              ))}
          </>
        )}
      </div>
      {/* --- Products Table --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left table-auto rounded-md overflow-hidden">
          <thead className="bg-orange-100 text-gray-600 uppercase text-xs sticky top-0">
            <tr>
              {/* <th className="p-2 font-semibold w-12">No.</th> */}
              <th className="p-2 font-semibold w-22">SKU</th>
              <th className="p-2 font-semibold w-28">Category</th>
              <th className="p-2 font-semibold w-60">Product Name</th>
              <th className="p-2 font-semibold w-16 text-right">PV</th>
              <th className="p-2 font-semibold w-20 text-right">Price</th>
              <th className="p-2 font-semibold w-16">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center p-8">
                  <div className="p-8 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-8 text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <ProductTableRow
                  key={product._id}
                  product={product}
                  onAddProduct={onAddProduct}
                  isFormValid={isFormValid}
                  index={index}
                  page={page}
                  limit={limit}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* --- Pagination --- */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isDisabled={!isFormValid}
      />
    </div>
  );
};

export default ProductSelection;
