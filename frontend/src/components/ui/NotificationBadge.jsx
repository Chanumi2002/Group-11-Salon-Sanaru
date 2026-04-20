/**
 * NotificationBadge Component
 * Displays a badge with a count notification on sidebar menu items
 * 
 * Usage:
 *   <NotificationBadge count={5} color="red" label="Pending approvals" />
 */
export function NotificationBadge({ 
  count, 
  color = "red", 
  label = "", 
  position = "top-right",
  size = "md"
}) {
  // Return null if no count or count is 0
  if (!count || count === 0) return null;

  // Size styling
  const sizeClasses = {
    sm: "h-4 w-4 text-xs",
    md: "h-5 w-5 text-xs",
    lg: "h-6 w-6 text-sm"
  };

  // Color styling for different badge types
  const colorClasses = {
    red: "bg-red-500 text-white",
    green: "bg-green-500 text-white",
    yellow: "bg-yellow-500 text-black",
    blue: "bg-blue-500 text-white",
    orange: "bg-orange-500 text-white",
    purple: "bg-purple-500 text-white"
  };

  // Position variants
  const positionClasses = {
    "top-right": "top-0 right-0",
    "top-left": "top-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0"
  };

  return (
    <span 
      className={`absolute ${positionClasses[position]} inline-flex items-center justify-center 
        ${sizeClasses[size]} rounded-full font-bold ${colorClasses[color]} 
        transform translate-x-1/2 -translate-y-1/2`}
      title={label}
      aria-label={label ? `${label}: ${count}` : `${count} notifications`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default NotificationBadge;
