"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
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
          case "s":
            e.preventDefault();
            dispatch({ type: "SET_TOOL", payload: "spray-brush" });
            break;
          case "d":
            e.preventDefault();
            dispatch({ type: "SET_TOOL", payload: "blur" });
            state.brushSize = 5;
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

  // Función para aplicar difuminado
  const applyBlur = (x: number, y: number, intensity: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const radius = state.brushSize * 5;
    const imageData = ctx.getImageData(
      Math.max(0, x - radius),
      Math.max(0, y - radius),
      radius * 2,
      radius * 2
    );

    // Aplicar un filtro de desenfoque simple
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const tempPixels = new Uint8ClampedArray(pixels);

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const idx = (i * width + j) * 4;

        // Distancia al centro
        const centerX = width / 2;
        const centerY = height / 2;
        const distance = Math.sqrt(
          Math.pow(j - centerX, 2) + Math.pow(i - centerY, 2)
        );

        // Solo aplicar dentro del radio del pincel
        if (distance <= radius) {
          let r = 0,
            g = 0,
            b = 0,
            a = 0,
            count = 0;

          // Tamaño del kernel basado en la intensidad
          const kernelSize = Math.max(1, Math.floor(intensity / 2));

          // Aplicar kernel de desenfoque
          for (let ky = -kernelSize; ky <= kernelSize; ky++) {
            for (let kx = -kernelSize; kx <= kernelSize; kx++) {
              const x = j + kx;
              const y = i + ky;

              if (x >= 0 && x < width && y >= 0 && y < height) {
                const offset = (y * width + x) * 4;
                r += tempPixels[offset];
                g += tempPixels[offset + 1];
                b += tempPixels[offset + 2];
                a += tempPixels[offset + 3];
                count++;
              }
            }
          }

          // Aplicar el promedio
          if (count > 0) {
            pixels[idx] = r / count;
            pixels[idx + 1] = g / count;
            pixels[idx + 2] = b / count;
            pixels[idx + 3] = a / count;
          }
        }
      }
    }

    ctx.putImageData(
      imageData,
      Math.max(0, x - radius),
      Math.max(0, y - radius)
    );
  };

  // Función para dibujar con spray
  const drawSpray = (x: number, y: number, color: string, size: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const density = size * 2; // Cantidad de puntos
    const radius = size * 2; // Radio del spray

    ctx.fillStyle = color;

    for (let i = 0; i < density; i++) {
      // Generar posición aleatoria dentro del radio
      const angle = Math.random() * Math.PI * 2;
      const radiusRandom = Math.random() * radius;
      const dotX = x + radiusRandom * Math.cos(angle);
      const dotY = y + radiusRandom * Math.sin(angle);

      // Dibujar punto
      ctx.beginPath();
      ctx.arc(dotX, dotY, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Función para dibujar con pincel de textura
  const drawTexturedBrush = (
    x: number,
    y: number,
    color: string,
    size: number
  ) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    // Crear un patrón de textura
    const patternSize = size * 2;
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = patternSize;
    patternCanvas.height = patternSize;
    const patternCtx = patternCanvas.getContext("2d");

    if (patternCtx) {
      // Dibujar textura base
      patternCtx.fillStyle = color;
      patternCtx.fillRect(0, 0, patternSize, patternSize);

      // Añadir ruido para textura
      for (let i = 0; i < (patternSize * patternSize) / 4; i++) {
        const noiseX = Math.floor(Math.random() * patternSize);
        const noiseY = Math.floor(Math.random() * patternSize);
        const brightness = Math.random() * 50 - 25; // Variación de brillo

        patternCtx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 0.5)`;
        patternCtx.fillRect(noiseX, noiseY, 1, 1);
      }

      // Usar el patrón para dibujar
      const pattern = ctx.createPattern(patternCanvas, "repeat");
      if (pattern) {
        ctx.save();
        ctx.fillStyle = pattern;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  };

  // Función para usar el cuenta gotas
  const useEyedropper = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    // Obtener el color del pixel
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const color = `#${pixel[0].toString(16).padStart(2, "0")}${pixel[1]
      .toString(16)
      .padStart(2, "0")}${pixel[2].toString(16).padStart(2, "0")}`;

    // Establecer el color y volver a la herramienta anterior
    dispatch({ type: "SET_COLOR", payload: color });
    dispatch({ type: "SET_EYEDROPPER_ACTIVE", payload: false });
    dispatch({ type: "SET_TOOL", payload: "brush" });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    startPos.current = pos;

    // Si la herramienta es eyedropper, tomar el color y salir
    if (state.tool === "eyedropper") {
      useEyedropper(Math.floor(pos.x), Math.floor(pos.y));
      return;
    }

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

    // Para spray
    if (state.tool === "spray-brush") {
      drawSpray(pos.x, pos.y, state.color, state.brushSize);
    }

    // Para difuminado
    if (state.tool === "blur") {
      applyBlur(pos.x, pos.y, state.brushSize);
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
        if (state.brushType === "round") {
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        } else if (state.brushType === "square") {
          ctx.lineCap = "square";
          ctx.lineJoin = "miter";
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        } else if (state.brushType === "texture") {
          drawTexturedBrush(pos.x, pos.y, state.color, state.brushSize);
        } else if (state.brushType === "spray") {
          drawSpray(pos.x, pos.y, state.color, state.brushSize);
        }
        break;

      case "eraser":
        // ctx.globalCompositeOperation = "destination-out";
        // * Solucion al borrador, era pintar por encima
        // * Y cambiar el color segun el tema
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = theme === "dark" ? "#000000" : "#ffffff";
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

      case "spray-brush":
        drawSpray(pos.x, pos.y, state.color, state.brushSize);
        break;

      case "blur":
        applyBlur(pos.x, pos.y, state.brushSize);
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
      case "eyedropper":
        return "crosshair";
      case "blur":
        return "cell";
      case "spray-brush":
        return "crosshair";
      default:
        return "default";
    }
  };

  return (
    <div className="flex-1 p-2 sm:p-4 overflow-hidden dark:bg-zinc-900 flex flex-col">
      <div className="bg-white dark:bg-black rounded-lg shadow-2xl overflow-hidden flex-1 flex items-center justify-center min-h-0">
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          // Eventos táctiles para móviles
          onTouchStart={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent("mousedown", {
              clientX: touch.clientX,
              clientY: touch.clientY,
            });
            startDrawing(mouseEvent as any);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent("mousemove", {
              clientX: touch.clientX,
              clientY: touch.clientY,
            });
            draw(mouseEvent as any);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopDrawing();
          }}
          className="block touch-none max-w-full h-auto"
          style={{
            cursor: getCursorStyle(),
            imageRendering: "pixelated",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            width: "auto",
            height: "auto",
          }}
        />
      </div>
    </div>
  );
}
