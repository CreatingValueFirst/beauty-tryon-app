import { toast } from 'sonner';

export const showSuccess = (message: string) => {
  return toast.success(message);
};

export const showError = (message: string) => {
  return toast.error(message);
};

export const showInfo = (message: string) => {
  return toast.info(message);
};

export const showWarning = (message: string) => {
  return toast.warning(message);
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const showPromise = <T,>(
  promise: Promise<T>,
  msgs: {
    loading: string;
    success: string | ((data: T) => string);
    error: string;
  }
) => {
  return toast.promise(promise, msgs);
};

// Re-export toast for advanced usage
export { toast };
