"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Brush,
  Eraser,
  Minus,
  Square,
  Circle,
  PaintBucket,
} from "lucide-react";
import { useCanvas, type Tool } from "../../contexts/CanvasContext";
import { ToggleTheme } from "../theme/theme-button";

const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
  {
    id: "brush",
    icon: <Brush className="w-4 h-4 sm:w-5 sm:h-5" />,
    label: "Pincel (B)",
  },
  {
    id: "eraser",
    icon: <Eraser className="w-4 h-4 sm:w-5 sm:h-5" />,
    label: "Borrador (E)",
  },
  {
    id: "line",
    icon: <Minus className="w-4 h-4 sm:w-5 sm:h-5" />,
    label: "Línea (L)",
  },
  {
    id: "rectangle",
    icon: <Square className="w-4 h-4 sm:w-5 sm:h-5" />,
    label: "Rectángulo (R)",
  },
  {
    id: "circle",
    icon: <Circle className="w-4 h-4 sm:w-5 sm:h-5" />,
    label: "Círculo (C)",
  },
  {
    id: "fill",
    icon: <PaintBucket className="w-4 h-4 sm:w-5 sm:h-5" />,
    label: "Relleno (F)",
  },
];

export default function Toolbar() {
  const { state, dispatch } = useCanvas();

  return (
    <div className=" p-2 sm:p-3">
      {/* Layout horizontal en móvil, vertical en desktop */}
      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
        {/* Herramientas */}
        <div className="flex lg:flex-col gap-1 sm:gap-2 min-w-max lg:min-w-0">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={state.tool === tool.id ? "default" : "ghost"}
              size="sm"
              onClick={() => dispatch({ type: "SET_TOOL", payload: tool.id })}
              className={`h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-full p-0 ${
                state.tool === tool.id ? "" : ""
              }`}
              title={tool.label}
            >
              {tool.icon}
            </Button>
          ))}
        </div>

        {/* Control de tamaño - Solo visible en desktop o como último elemento en móvil */}
        <div className="hidden lg:block lg:mt-6 lg:space-y-3 min-w-max lg:min-w-0">
          <div className="text-xs font-medium">Tamaño</div>
          <div className="px-2">
            <Slider
              value={[state.brushSize]}
              onValueChange={(value) =>
                dispatch({ type: "SET_BRUSH_SIZE", payload: value[0] })
              }
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          <div className="text-xs text-center">{state.brushSize}px</div>
        </div>

        {/* Control de tamaño para móvil */}
        <div className="flex lg:hidden items-center gap-2 min-w-max">
          <span className="text-xs font-medium whitespace-nowrap">Tamaño:</span>
          <div className="w-16 sm:w-20">
            <Slider
              value={[state.brushSize]}
              onValueChange={(value) =>
                dispatch({ type: "SET_BRUSH_SIZE", payload: value[0] })
              }
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          <span className="text-xs min-w-max">{state.brushSize}px</span>
        </div>

        <div className="flex justify-center">
          <ToggleTheme />
        </div>
      </div>
    </div>
  );
}
