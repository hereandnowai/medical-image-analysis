
import React from 'react';
import { ErrorIcon, InfoIcon, CloseIcon, CheckIcon } from './icons'; // Added CheckIcon import

interface AlertProps {
  type: 'error' | 'info' | 'success' | 'warning';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const baseClasses = "p-4 rounded-lg flex items-start space-x-3 shadow-md";
  let specificClasses = "";
  let IconComponent;

  switch (type) {
    case 'error':
      specificClasses = "bg-red-700/60 text-red-100 border border-red-500";
      IconComponent = ErrorIcon;
      break;
    case 'info':
      specificClasses = "bg-blue-700/60 text-blue-100 border border-blue-500";
      IconComponent = InfoIcon;
      break;
    case 'success':
      specificClasses = "bg-green-700/60 text-green-100 border border-green-500";
      IconComponent = CheckIcon; // Now uses the imported CheckIcon
      break;
    case 'warning':
      specificClasses = "bg-yellow-700/60 text-yellow-100 border border-yellow-500";
      IconComponent = InfoIcon; // Or a specific warning icon
      break;
    default:
      specificClasses = "bg-slate-600 text-slate-100";
      IconComponent = InfoIcon;
  }

  // Removed the local dummy CheckIcon definition:
  // const CheckIcon = InfoIcon; 

  return (
    <div className={`${baseClasses} ${specificClasses}`} role="alert">
      {IconComponent && <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />}
      <p className="flex-grow text-sm">{message}</p>
      {onClose && (
        <button onClick={onClose} className="-m-1 p-1 text-current hover:opacity-75" aria-label="Close alert">
          <CloseIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
