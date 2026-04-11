import { toast } from "sonner";

type ToastDescription = string | undefined;

export const notify = {
  success(title: string, description?: ToastDescription) {
    toast.success(title, { description });
  },
  info(title: string, description?: ToastDescription) {
    toast.info(title, { description });
  },
  warning(title: string, description?: ToastDescription) {
    toast.warning(title, { description });
  },
  error(title: string, description?: ToastDescription) {
    toast.error(title, { description });
  },
};
