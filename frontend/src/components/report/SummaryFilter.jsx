import { useState, useEffect } from "react";


const SummaryFilter = ({ onFilter }) => {
  const today = new Date().toISOString().split("T")[0]; // วันที่ปัจจุบันใน YYYY-MM-DD
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [recordBy, setRecordBy] = useState("");

  useEffect(() => {
    console.log("SummaryFilter: Initial filter:", {
      startDate,
      endDate,
      recordBy,
    });
    onFilter({ startDate, endDate, recordBy });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("SummaryFilter: Search:", {
      startDate,
      endDate,
      recordBy,
    });
    onFilter({ startDate, endDate, recordBy });
  };

  const handleClear = () => {
    setStartDate(today);
    setEndDate(today);
    setRecordBy("");
    console.log("SummaryFilter: Clear:", {
      startDate: today,
      endDate: today,
      recordBy: "",
    });
    onFilter({ startDate: today, endDate: today, recordBy: "" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow-md mb-6"
    >
      {/* <h3 className="text-xl font-bold mb-4">Filter Summary</h3> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-gray-700 text-sm">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded border-gray-400 focus:outline-none focus:border-orange-600 text-sm"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border border-gray-400 rounded focus:outline-none focus:border-orange-600 text-sm"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm">Record By</label>
          <input
            placeholder="Username Staff"
            type="text"
            value={recordBy}
            onChange={(e) => setRecordBy(e.target.value)}
            className="w-full p-2 border rounded border-gray-400 focus:outline-none focus:border-orange-600 text-sm"
          />
        </div>

        <div className="flex gap-4 mt-4">
          <button
            type="submit"
            className="w-full bg-primary text-white p-2 font-semibold cursor-pointer rounded hover:bg-primary-dark"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="w-full bg-gray-500 text-white p-2 font-semibold rounded cursor-pointer hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
};

export default SummaryFilter;
