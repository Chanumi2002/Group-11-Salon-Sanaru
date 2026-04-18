/**
 * NotificationBadge Component
 * Displays a colored badge with count for sidebar notifications
 * 
 * Props:
 *   count (number): The count to display (0 = hidden)
 *   color (string): Badge color - 'red', 'green', 'yellow', 'blue', 'orange', 'purple'
 *   label (string): Tooltip/aria-label text
 *   position (string): Badge position - 'top-right', 'top-left', 'bottom-right', 'bottom-left'
 *   size (string): Badge size - 'sm', 'md', 'lg'
 */
import React from "react";

const colorClasses = {
  red: "bg-red-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  purple: "bg-purple-500",
};

const positionClasses = {
  "top-right": "absolute -top-2 -right-2",
  "top-left": "absolute -top-2 -left-2",
  "bottom-right": "absolute -bottom-2 -right-2",
  "bottom-left": "absolute -bottom-2 -left-2",
};

const sizeClasses = {
  sm: "h-5 w-5 text-xs",
  md: "h-6 w-6 text-sm",
  lg: "h-7 w-7 text-base",
};

export default function NotificationBadge({
  count,
  color = "red",
  label = "Notification count",
  position = "top-right",
  size = "md",
}) {
  // Don't render if count is 0 or undefined
  if (!count || count === 0) {
    return null;
  }

  const displayCount = count > 99 ? "99+" : count;
  const colorClass = colorClasses[color] || colorClasses.red;
  const positionClass = positionClasses[position] || positionClasses["top-right"];
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`${positionClass} ${colorClass} ${sizeClass} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
      role="status"
      aria-label={`${label}: ${count}`}
      title={`${label}: ${count}`}
    >
      {displayCount}
    </div>
  );
}
