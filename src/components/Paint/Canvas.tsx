"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { useCanvas } from "../../contexts/CanvasContext";
import { useTheme } from "next-themes";

export default function Canvas() {
  const { state, dispatch, canvasRef } = useCanvas();
  const startPos = useRef({ x: 0, y: 0 });
  const isDrawingShape = useRef(false);
  const tempImageData = useRef<ImageData | null>(null);
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
      if (canvas) {
        if (canvas) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          dispatch({ type: "ADD_TO_HISTORY", payload: imageData });
        }
      }
    }
  }, [dispatch, theme]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevenir que se ejecuten en inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "z":
            console.log("HOLA");
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
            e.preventDefault();
            dispatch({ type: "SET_TOOL", payload: "brush" });
            break;
          case "e":
            e.preventDefault();
            dispatch({ type: "SET_TOOL", payload: "eraser" });
            break;
          case "l":
            e.preventDefault();
            dispatch({ type: "SET_TOOL", payload: "line" });
            break;
          case "r":
            e.preventDefault();
            dispatch({ type: "SET_TOOL", payload: "rectangle" });
            break;
          case "c":
            e.preventDefault();
            dispatch({ type: "SET_TOOL", payload: "circle" });
            break;
          case "f":
            e.preventDefault();
            dispatch({ type: "SET_TOOL", payload: "fill" });
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, state.historyIndex, state.history.length]);

  const handleUndo = () => {
    if (state.historyIndex > 0) {
      dispatch({ type: "UNDO" });
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && state.history[state.historyIndex - 1]) {
        ctx.putImageData(state.history[state.historyIndex - 1], 0, 0);
      }
    }
  };

  const handleRedo = () => {
    if (state.historyIndex < state.history.length - 1) {
      dispatch({ type: "REDO" });
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && state.history[state.historyIndex + 1]) {
        ctx.putImageData(state.history[state.historyIndex + 1], 0, 0);
      }
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

  // Función de relleno (flood fill)
  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const startPos = (startY * canvas.width + startX) * 4;

    // Color objetivo (el que vamos a reemplazar)
    const targetR = data[startPos];
    const targetG = data[startPos + 1];
    const targetB = data[startPos + 2];
    const targetA = data[startPos + 3];

    // Color de relleno
    const fillR = Number.parseInt(fillColor.slice(1, 3), 16);
    const fillG = Number.parseInt(fillColor.slice(3, 5), 16);
    const fillB = Number.parseInt(fillColor.slice(5, 7), 16);
    const fillA = 255;

    // Si el color es el mismo, no hacer nada
    if (
      targetR === fillR &&
      targetG === fillG &&
      targetB === fillB &&
      targetA === fillA
    ) {
      return;
    }

    const stack = [[startX, startY]];

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

      const pos = (y * canvas.width + x) * 4;
      if (
        data[pos] !== targetR ||
        data[pos + 1] !== targetG ||
        data[pos + 2] !== targetB ||
        data[pos + 3] !== targetA
      ) {
        continue;
      }

      data[pos] = fillR;
      data[pos + 1] = fillG;
      data[pos + 2] = fillB;
      data[pos + 3] = fillA;

      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    startPos.current = pos;
    dispatch({ type: "SET_DRAWING", payload: true });

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    // Para herramientas de relleno
    if (state.tool === "fill") {
      floodFill(Math.floor(pos.x), Math.floor(pos.y), state.color);
      if (canvas) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        dispatch({ type: "ADD_TO_HISTORY", payload: imageData });
      }
      dispatch({ type: "SET_DRAWING", payload: false });
      return;
    }

    // Para formas, guardar el estado actual
    if (
      state.tool === "line" ||
      state.tool === "rectangle" ||
      state.tool === "circle"
    ) {
      if (canvas) {
        tempImageData.current = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
      isDrawingShape.current = true;
    }

    // Para pincel y borrador
    if (state.tool === "brush" || state.tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }

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

      case "line":
        if (tempImageData.current) {
          ctx.putImageData(tempImageData.current, 0, 0);
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = state.color;
          ctx.lineWidth = state.brushSize;
          ctx.beginPath();
          ctx.moveTo(startPos.current.x, startPos.current.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        }
        break;

      case "rectangle":
        if (tempImageData.current) {
          ctx.putImageData(tempImageData.current, 0, 0);
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = state.color;
          ctx.lineWidth = state.brushSize;
          const width = pos.x - startPos.current.x;
          const height = pos.y - startPos.current.y;
          ctx.strokeRect(startPos.current.x, startPos.current.y, width, height);
        }
        break;

      case "circle":
        if (tempImageData.current) {
          ctx.putImageData(tempImageData.current, 0, 0);
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = state.color;
          ctx.lineWidth = state.brushSize;
          const radius = Math.sqrt(
            Math.pow(pos.x - startPos.current.x, 2) +
              Math.pow(pos.y - startPos.current.y, 2)
          );
          ctx.beginPath();
          ctx.arc(
            startPos.current.x,
            startPos.current.y,
            radius,
            0,
            2 * Math.PI
          );
          ctx.stroke();
        }
        break;
    }
  };

  const stopDrawing = () => {
    if (!state.isDrawing) return;

    dispatch({ type: "SET_DRAWING", payload: false });
    isDrawingShape.current = false;
    tempImageData.current = null;

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
