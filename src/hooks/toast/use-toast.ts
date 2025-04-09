
"use client";

import * as React from "react";
import { Toast } from "./types";
import { ToastContext, dispatch } from "./toast-context";
import { genId } from "./toast-utils";

// Toast hook
export function useToast() {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return {
    toasts: context.state.toasts,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

// Toast function that can be called outside of React components
export function toast({ ...props }: Toast) {
  const id = genId();

  const update = (props: any) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}
