import { AlertCircle, CheckCircle2, XCircle, Trash2 } from "lucide-react";

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "default", // default, success, danger, warning
  icon: CustomIcon,
}) {
  if (!isOpen) return null;

  const typeConfig = {
    default: {
      icon: AlertCircle,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      confirmBg: "bg-blue-600 hover:bg-blue-700",
      borderColor: "border-blue-200",
    },
    success: {
      icon: CheckCircle2,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
      confirmBg: "bg-green-600 hover:bg-green-700",
      borderColor: "border-green-200",
    },
    danger: {
      icon: Trash2,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      confirmBg: "bg-red-600 hover:bg-red-700",
      borderColor: "border-red-200",
    },
    warning: {
      icon: AlertCircle,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50",
      confirmBg: "bg-amber-600 hover:bg-amber-700",
      borderColor: "border-amber-200",
    },
  };

  const config = typeConfig[type] || typeConfig.default;
  const Icon = CustomIcon || config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Dialog Box */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
        {/* Header with colored accent */}
        <div className={`${config.bgColor} border-b ${config.borderColor} px-6 py-6`}>
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 h-12 w-12 rounded-full ${config.bgColor} flex items-center justify-center border ${config.borderColor}`}
            >
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Footer with actions */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg ${config.confirmBg} text-white font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationDialog;
