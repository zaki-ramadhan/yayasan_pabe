"use client";

import * as React from "react";

const TOAST_LIMIT = 3;
const TOAST_EXIT_ANIMATION_DELAY = 300; // Delay for smooth 300ms exit animation before removal
const DEFAULT_TOAST_DURATION = 4000; // Auto-dismiss after 4 seconds

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const toastTimeouts = new Map();

const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId: toastId,
    });
  }, TOAST_EXIT_ANIMATION_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners = [];

let memoryState = { toasts: [] };

function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function toast({ duration = DEFAULT_TOAST_DURATION, ...props }) {
  const id = genId();
  let dismissTimer;

  const update = (props) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    });

  const dismiss = () => {
    if (dismissTimer) clearTimeout(dismissTimer);
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });
  };

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  // Auto-dismiss after specified duration
  if (duration > 0 && duration !== Infinity) {
    dismissTimer = setTimeout(() => {
      dismiss();
    }, duration);
  }

  return {
    id: id,
    dismiss,
    update,
  };
}

// Ergonomic helpers for shadcn toast
toast.success = (titleOrDescription, options = {}) => {
  if (typeof titleOrDescription === "string" && !options.title && !options.description) {
    return toast({
      title: titleOrDescription,
      variant: "success",
      ...options,
    });
  }
  return toast({
    title: options.title || "Berhasil",
    description: typeof titleOrDescription === "string" ? titleOrDescription : options.description,
    variant: "success",
    ...options,
  });
};

toast.error = (titleOrDescription, options = {}) => {
  if (typeof titleOrDescription === "string" && !options.title && !options.description) {
    return toast({
      title: titleOrDescription,
      variant: "destructive",
      ...options,
    });
  }
  return toast({
    title: options.title || "Terjadi Kesalahan",
    description: typeof titleOrDescription === "string" ? titleOrDescription : options.description,
    variant: "destructive",
    ...options,
  });
};

toast.info = (titleOrDescription, options = {}) => {
  if (typeof titleOrDescription === "string" && !options.title && !options.description) {
    return toast({
      title: titleOrDescription,
      variant: "info",
      ...options,
    });
  }
  return toast({
    title: options.title || "Informasi",
    description: typeof titleOrDescription === "string" ? titleOrDescription : options.description,
    variant: "info",
    ...options,
  });
};

toast.warning = (titleOrDescription, options = {}) => {
  if (typeof titleOrDescription === "string" && !options.title && !options.description) {
    return toast({
      title: titleOrDescription,
      variant: "warning",
      ...options,
    });
  }
  return toast({
    title: options.title || "Peringatan",
    description: typeof titleOrDescription === "string" ? titleOrDescription : options.description,
    variant: "warning",
    ...options,
  });
};

toast.dismiss = (toastId) => {
  dispatch({ type: actionTypes.DISMISS_TOAST, toastId });
};

function useToast() {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId) =>
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  };
}

export { useToast, toast };
