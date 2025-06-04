"use client";

import type React from "react";
import { createContext, useContext, useReducer, useRef } from "react";

export type Tool =
  | "brush"
  | "eraser"
  | "line"
  | "rectangle"
  | "circle"
  | "fill"
  | "round-brush"
  | "square-brush"
  | "texture-brush"
  | "spray-brush"
  | "blur"
  | "eyedropper";

export type BrushType = "round" | "square" | "texture" | "spray";

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  canvas: HTMLCanvasElement;
}

interface CanvasState {
  tool: Tool;
  brushType: BrushType;
  color: string;
  brushSize: number;
  isDrawing: boolean;
  history: ImageData[];
  historyIndex: number;
  isFullscreen: boolean;
  layers: Layer[];
  activeLayerId: string;
  isEyedropperActive: boolean;
}

type CanvasAction =
  | { type: "SET_TOOL"; payload: Tool }
  | { type: "SET_BRUSH_TYPE"; payload: BrushType }
  | { type: "SET_COLOR"; payload: string }
  | { type: "SET_BRUSH_SIZE"; payload: number }
  | { type: "SET_DRAWING"; payload: boolean }
  | { type: "ADD_TO_HISTORY"; payload: ImageData }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "TOGGLE_FULLSCREEN" }
  | { type: "ADD_LAYER"; payload: Layer }
  | { type: "DELETE_LAYER"; payload: string }
  | { type: "SET_ACTIVE_LAYER"; payload: string }
  | { type: "TOGGLE_LAYER_VISIBILITY"; payload: string }
  | { type: "SET_LAYER_OPACITY"; payload: { id: string; opacity: number } }
  | { type: "RENAME_LAYER"; payload: { id: string; name: string } }
  | { type: "SET_EYEDROPPER_ACTIVE"; payload: boolean };

const initialState: CanvasState = {
  tool: "brush",
  brushType: "round",
  color: "#3b82f6",
  brushSize: 3,
  isDrawing: false,
  history: [],
  historyIndex: -1,
  isFullscreen: false,
  layers: [],
  activeLayerId: "",
  isEyedropperActive: false,
};

function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case "SET_TOOL":
      return {
        ...state,
        tool: action.payload,
        isEyedropperActive: action.payload === "eyedropper",
      };
    case "SET_BRUSH_TYPE":
      return { ...state, brushType: action.payload };
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
    case "ADD_LAYER":
      return {
        ...state,
        layers: [...state.layers, action.payload],
        activeLayerId: action.payload.id,
      };
    case "DELETE_LAYER":
      const filteredLayers = state.layers.filter(
        (layer) => layer.id !== action.payload
      );
      return {
        ...state,
        layers: filteredLayers,
        activeLayerId: filteredLayers.length > 0 ? filteredLayers[0].id : "",
      };
    case "SET_ACTIVE_LAYER":
      return { ...state, activeLayerId: action.payload };
    case "TOGGLE_LAYER_VISIBILITY":
      return {
        ...state,
        layers: state.layers.map((layer) =>
          layer.id === action.payload
            ? { ...layer, visible: !layer.visible }
            : layer
        ),
      };
    case "SET_LAYER_OPACITY":
      return {
        ...state,
        layers: state.layers.map((layer) =>
          layer.id === action.payload.id
            ? { ...layer, opacity: action.payload.opacity }
            : layer
        ),
      };
    case "RENAME_LAYER":
      return {
        ...state,
        layers: state.layers.map((layer) =>
          layer.id === action.payload.id
            ? { ...layer, name: action.payload.name }
            : layer
        ),
      };
    case "SET_EYEDROPPER_ACTIVE":
      return { ...state, isEyedropperActive: action.payload };
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
