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
  { id: "brush", icon: <Brush className="w-5 h-5" />, label: "Pincel (B)" },
  { id: "eraser", icon: <Eraser className="w-5 h-5" />, label: "Borrador (E)" },
  { id: "line", icon: <Minus className="w-5 h-5" />, label: "Línea (L)" },
  {
    id: "rectangle",
    icon: <Square className="w-5 h-5" />,
    label: "Rectángulo (R)",
  },
  { id: "circle", icon: <Circle className="w-5 h-5" />, label: "Círculo (C)" },
  {
    id: "fill",
    icon: <PaintBucket className="w-5 h-5" />,
    label: "Relleno (F)",
  },
];

export default function Toolbar() {
  const { state, dispatch } = useCanvas();

  return (
    <div className="w-20 p-3 flex flex-col gap-3 dark:bg-black">
      <div className="space-y-2">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={state.tool === tool.id ? "default" : "ghost"}
            size="sm"
            onClick={() => dispatch({ type: "SET_TOOL", payload: tool.id })}
            className={`w-full h-12 ${state.tool === tool.id ? "" : ""}`}
            title={tool.label}
          >
            {tool.icon}
          </Button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <div className="text-xs  font-medium">Tamaño</div>
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

      <div className="mt-6 space-y-3">
        <div className="flex justify-center">
          <ToggleTheme />
        </div>
      </div>
    </div>
  );
}
