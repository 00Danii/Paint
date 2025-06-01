"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { useCanvas } from "../../contexts/CanvasContext";
import { useTheme } from "next-themes";

export default function Canvas() {
  const { state, dispatch, canvasRef } = useCanvas();
  const startPos = useRef({ x: 0, y: 0 });
  const tempCanvas = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.fillStyle = theme == "dark" ? "#000000" : "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Guardar estado inicial
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      dispatch({ type: "ADD_TO_HISTORY", payload: imageData });
    }
  }, [dispatch]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case "y":
            e.preventDefault();
            handleRedo();
            break;
        }
      } else {
        switch (e.key.toLowerCase()) {
          case "b":
            dispatch({ type: "SET_TOOL", payload: "brush" });
            break;
          case "e":
            dispatch({ type: "SET_TOOL", payload: "eraser" });
            break;
          case "l":
            dispatch({ type: "SET_TOOL", payload: "line" });
            break;
          case "r":
            dispatch({ type: "SET_TOOL", payload: "rectangle" });
            break;
          case "c":
            dispatch({ type: "SET_TOOL", payload: "circle" });
            break;
          case "f":
            dispatch({ type: "SET_TOOL", payload: "fill" });
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const handleUndo = () => {
    dispatch({ type: "UNDO" });
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && state.history[state.historyIndex - 1]) {
      ctx.putImageData(state.history[state.historyIndex - 1], 0, 0);
    }
  };

  const handleRedo = () => {
    dispatch({ type: "REDO" });
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && state.history[state.historyIndex + 1]) {
      ctx.putImageData(state.history[state.historyIndex + 1], 0, 0);
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    startPos.current = pos;
    dispatch({ type: "SET_DRAWING", payload: true });

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    if (state.tool === "brush" || state.tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!state.isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const pos = getMousePos(e);

    switch (state.tool) {
      case "brush":
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = state.color;
        ctx.lineWidth = state.brushSize;
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        break;

      case "eraser":
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = state.brushSize * 2;
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        break;
    }
  };

  const stopDrawing = () => {
    if (!state.isDrawing) return;

    dispatch({ type: "SET_DRAWING", payload: false });

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    // Guardar en historial
    if (canvas) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      dispatch({ type: "ADD_TO_HISTORY", payload: imageData });
    }
  };

  const getCursorStyle = () => {
    switch (state.tool) {
      case "brush":
        return "crosshair";
      case "eraser":
        return "grab";
      case "line":
      case "rectangle":
      case "circle":
        return "crosshair";
      case "fill":
        return "pointer";
      default:
        return "default";
    }
  };

  return (
    <div className="flex-1 p-4 overflow-hidden dark:bg-zinc-900">
      <div className="bg-white dark:bg-black rounded-lg shadow-2xl  overflow-hidden h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="block max-w-full h-auto"
          style={{ cursor: getCursorStyle() }}
        />
      </div>
    </div>
  );
}
