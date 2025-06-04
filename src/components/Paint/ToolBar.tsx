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
  Sparkles,
  ChevronDown,
  SprayCan,
  Hand,
} from "lucide-react";
import {
  useCanvas,
  type Tool,
  type BrushType,
} from "../../contexts/CanvasContext";
import { ToggleTheme } from "../theme/theme-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const tools: {
  id: Tool;
  icon: React.ReactNode;
  label: string;
  hasBrushTypes?: boolean;
}[] = [
  {
    id: "brush",
    icon: <Brush className="w-4 h-4 sm:w-5 sm:h-5" />,
    label: "Pincel (B)",
    hasBrushTypes: true,
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
    id: "blur",
    icon: <Hand className="w-4 h-4 sm:w-5 sm:h-5" />,
    label: "Difuminar (D)",
  },
  {
    id: "fill",
    icon: <PaintBucket className="w-4 h-4 sm:w-5 sm:h-5" />,
    label: "Relleno (F)",
  },
];

const brushTypes: { id: BrushType; name: string; icon: React.ReactNode }[] = [
  { id: "round", name: "Redondo", icon: <Circle className="w-4 h-4" /> },
  { id: "square", name: "Cuadrado", icon: <Square className="w-4 h-4" /> },
  { id: "texture", name: "Textura", icon: <Sparkles className="w-4 h-4" /> },
  { id: "spray", name: "Spray", icon: <SprayCan className="w-4 h-4" /> },
];

export default function Toolbar() {
  const { state, dispatch } = useCanvas();

  const handleToolClick = (toolId: Tool) => {
    dispatch({ type: "SET_TOOL", payload: toolId });
  };

  const handleBrushTypeSelect = (brushType: BrushType) => {
    dispatch({ type: "SET_BRUSH_TYPE", payload: brushType });
  };

  const getCurrentBrushTypeIcon = () => {
    const currentBrushType = brushTypes.find(
      (brush) => brush.id === state.brushType
    );
    return currentBrushType?.icon || <Circle className="w-3 h-3" />;
  };

  return (
    <div className=" p-2 sm:p-3">
      {/* Layout horizontal en móvil, vertical en desktop */}
      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
        {/* Herramientas */}
        <div className="flex lg:flex-col gap-1 sm:gap-2 min-w-max lg:min-w-0">
          {tools.map((tool) => {
            const isActive = state.tool === tool.id;

            // Si la herramienta tiene tipos de pincel, mostrar dropdown
            if (tool.hasBrushTypes && tool.id === "brush") {
              return (
                <DropdownMenu key={tool.id}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-full p-0 relative ${
                        isActive ? "shadow-lg" : ""
                      }`}
                      title={tool.label}
                      onClick={() => handleToolClick(tool.id)}
                    >
                      <div className="flex items-center justify-center">
                        {tool.icon}
                        {isActive && (
                          <div className="absolute -bottom-1 -right-1  rounded-full p-1">
                            {getCurrentBrushTypeIcon()}
                          </div>
                        )}
                      </div>
                      <ChevronDown className="absolute -bottom-0.5 -right-0.5 w-2 h-2 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start">
                    {brushTypes.map((brush) => (
                      <DropdownMenuItem
                        key={brush.id}
                        onClick={() => {
                          handleToolClick(tool.id);
                          handleBrushTypeSelect(brush.id);
                        }}
                        className={` cursor-pointer ${
                          state.brushType === brush.id && isActive
                            ? "bg-gray-200 dark:bg-neutral-800"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {brush.icon}
                          {brush.name}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            // Herramientas normales sin dropdown
            return (
              <Button
                key={tool.id}
                variant={state.tool === tool.id ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  dispatch({ type: "SET_TOOL", payload: tool.id });
                  if (tool.id == "blur") state.brushSize = 5;
                }}
                className={`h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-full p-0 ${
                  state.tool === tool.id ? "" : ""
                }`}
                title={tool.label}
              >
                {tool.icon}
              </Button>
            );
          })}
        </div>

        {/* Control de tamaño - Solo visible en desktop o como último elemento en móvil */}
        <div className="hidden lg:block lg:mt-6 lg:space-y-3 min-w-max lg:min-w-0">
          <div className="text-xs font-medium">
            {state.tool === "blur" ? "Intensidad" : "Tamaño"}
          </div>
          <div className="px-2">
            <Slider
              value={[state.brushSize]}
              onValueChange={(value) =>
                dispatch({ type: "SET_BRUSH_SIZE", payload: value[0] })
              }
              max={state.tool === "blur" ? 10 : 50}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          <div className="text-xs text-center">
            {" "}
            {state.brushSize}
            {state.tool === "blur" ? "" : "px"}
          </div>
        </div>

        {/* Control de tamaño para móvil */}
        <div className="flex lg:hidden items-center gap-2 min-w-max">
          <span className="text-xs font-medium whitespace-nowrap">
            {" "}
            {state.tool === "blur" ? "Intensidad" : "Tamaño"}
          </span>
          <div className="w-16 sm:w-20">
            <Slider
              value={[state.brushSize]}
              onValueChange={(value) =>
                dispatch({ type: "SET_BRUSH_SIZE", payload: value[0] })
              }
              max={state.tool === "blur" ? 10 : 50}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          <span className="text-xs min-w-max">
            {" "}
            {state.brushSize}
            {state.tool === "blur" ? "" : "px"}
          </span>
        </div>

        <div className="flex justify-center">
          <ToggleTheme />
        </div>
      </div>
    </div>
  );
}
