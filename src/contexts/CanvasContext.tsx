"use client";

import type React from "react";
import { createContext, useContext, useReducer, useRef } from "react";

export type Tool =
  | "brush"
  | "eraser"
  | "line"
  | "rectangle"
  | "circle"
  | "fill";

interface CanvasState {
  tool: Tool;
  color: string;
  brushSize: number;
  isDrawing: boolean;
  history: ImageData[];
  historyIndex: number;
  isFullscreen: boolean;
}

type CanvasAction =
  | { type: "SET_TOOL"; payload: Tool }
  | { type: "SET_COLOR"; payload: string }
  | { type: "SET_BRUSH_SIZE"; payload: number }
  | { type: "SET_DRAWING"; payload: boolean }
  | { type: "ADD_TO_HISTORY"; payload: ImageData }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "TOGGLE_FULLSCREEN" };

const initialState: CanvasState = {
  tool: "brush",
  color: "#3b82f6",
  brushSize: 3,
  isDrawing: false,
  history: [],
  historyIndex: -1,
  isFullscreen: false,
};

function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case "SET_TOOL":
      return { ...state, tool: action.payload };
    case "SET_COLOR":
      return { ...state, color: action.payload };
    case "SET_BRUSH_SIZE":
      return { ...state, brushSize: action.payload };
    case "SET_DRAWING":
      return { ...state, isDrawing: action.payload };
    case "ADD_TO_HISTORY":
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(action.payload);
      return {
        ...state,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    case "UNDO":
      if (state.historyIndex > 0) {
        return { ...state, historyIndex: state.historyIndex - 1 };
      }
      return state;
    case "REDO":
      if (state.historyIndex < state.history.length - 1) {
        return { ...state, historyIndex: state.historyIndex + 1 };
      }
      return state;
    case "TOGGLE_FULLSCREEN":
      return { ...state, isFullscreen: !state.isFullscreen };
    default:
      return state;
  }
}

interface CanvasContextType {
  state: CanvasState;
  dispatch: React.Dispatch<CanvasAction>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(canvasReducer, initialState);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <CanvasContext.Provider value={{ state, dispatch, canvasRef }}>
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
}
