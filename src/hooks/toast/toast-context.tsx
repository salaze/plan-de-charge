
"use client";

import * as React from "react";
import { Action, State, actionTypes } from "./types";
import { reducer } from "./reducer";

// Initial state
export const initialState: State = { toasts: [] };

// Create a React context to store the state
export const ToastContext = React.createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// This allows us to manually add/remove toasts outside of React components
export let listeners: Array<(state: State) => void> = [];
export let memoryState: State = initialState;

export function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

// Export the ToastProvider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatchState] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    listeners.push(() => {
      dispatchState({ type: "ADD_TOAST", toast: { ...memoryState.toasts[0], id: memoryState.toasts[0]?.id || "" } });
    });
    
    return () => {
      const index = listeners.findIndex(listener => 
        listener.toString().includes("dispatchState")
      );
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [dispatchState]);

  return React.createElement(
    ToastContext.Provider,
    { value: { state, dispatch: dispatchState } },
    children
  );
};
