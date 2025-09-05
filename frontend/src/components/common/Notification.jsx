const Notification = ({ message, type }) => {
  if (!message) return null;

  const bgColor = type === "error" ? "bg-red-500" : "bg-green-500";

  return (
    <div className={`p-4 mb-4 text-white rounded ${bgColor}`}>{message}</div>
  );
};

export default Notification;
