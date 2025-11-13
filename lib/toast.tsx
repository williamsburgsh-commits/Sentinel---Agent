import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, AlertTriangle, Info, DollarSign, Bell, Copy, Zap } from 'lucide-react';
import { colors } from './design-tokens';

// Custom toast configuration
const toastConfig = {
  duration: 4000,
  position: 'top-right' as const,
  style: {
    background: colors.background.secondary,
    color: colors.neutral[100],
    border: `1px solid ${colors.border.light}`,
    borderRadius: '12px',
    padding: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(12px)',
    maxWidth: 'calc(100vw - 32px)', // Ensure toast doesn't exceed screen width
    width: 'auto',
    minWidth: '300px',
    maxHeight: '90vh', // Prevent toast from being too tall
    overflow: 'auto', // Add scroll if content is too long
  },
};


// Success toast with checkmark
export const showSuccessToast = (message: string, description?: string) => {
  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-800 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-green-700/30`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-white">{message}</p>
              {description && (
                <p className="mt-1 text-sm text-gray-400">{description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-700">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-300 focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration: toastConfig.duration, position: toastConfig.position }
  );
};

// Error toast with X icon
export const showErrorToast = (message: string, description?: string) => {
  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-800 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-red-700/30`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-white">{message}</p>
              {description && (
                <p className="mt-1 text-sm text-gray-400">{description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-700">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-300 focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration: toastConfig.duration, position: toastConfig.position }
  );
};

// Warning toast with triangle
export const showWarningToast = (message: string, description?: string) => {
  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } w-full bg-gray-800 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-yellow-700/30`}
        style={{
          maxWidth: 'calc(100vw - 32px)',
          width: 'auto',
          minWidth: '300px',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-white">{message}</p>
              {description && (
                <p className="mt-1 text-sm text-gray-400">{description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-700">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-300 focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration: toastConfig.duration, position: toastConfig.position }
  );
};

// Info toast
export const showInfoToast = (message: string, description?: string) => {
  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-800 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-blue-700/30`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <Info className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-white">{message}</p>
              {description && (
                <p className="mt-1 text-sm text-gray-400">{description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-700">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-300 focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration: toastConfig.duration, position: toastConfig.position }
  );
};

// Payment sent toast
export const showPaymentToast = (amount: string, token: string) => {
  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-800 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-green-700/30`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-white">Payment Sent</p>
              <p className="mt-1 text-sm text-gray-400">
                {amount} {token} transferred successfully
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-700">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-300 focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration: toastConfig.duration, position: toastConfig.position }
  );
};

// Alert triggered toast
export const showAlertToast = (message: string, price: string) => {
  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-800 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-red-700/30 animate-pulse`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <Bell className="h-5 w-5 text-red-500 animate-bounce" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-white">Alert Triggered!</p>
              <p className="mt-1 text-sm text-gray-400">
                {message} Current price: {price}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-700">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-300 focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration: 6000, position: toastConfig.position }
  );
};

// Copied to clipboard toast
export const showCopiedToast = (text: string = 'Copied to clipboard') => {
  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-800 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-blue-700/30`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <Copy className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-white">{text}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-700">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-300 focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration: 2000, position: toastConfig.position }
  );
};

// Airdrop success toast
export const showAirdropToast = (amount: string) => {
  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-800 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-purple-700/30`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <Zap className="h-5 w-5 text-purple-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-white">Airdrop Successful!</p>
              <p className="mt-1 text-sm text-gray-400">
                Received {amount} SOL
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-700">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-300 focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration: toastConfig.duration, position: toastConfig.position }
  );
};
