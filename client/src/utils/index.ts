// Format a number as USD currency
export const formatPrice = (amount: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

// Format a date string to a readable format
export const formatDate = (dateString: string): string =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));

// Map order status to Tailwind badge classes
export const getStatusBadgeClass = (status: string): string => {
  const map: Record<string, string> = {
    PENDING: "badge bg-yellow-100 text-yellow-800",
    SHIPPED: "badge bg-blue-100 text-blue-800",
    DELIVERED: "badge bg-green-100 text-green-800",
    CANCELLED: "badge bg-red-100 text-red-800",
  };
  return map[status] ?? "badge bg-gray-100 text-gray-800";
};

// Capitalize first letter, lowercase rest
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
