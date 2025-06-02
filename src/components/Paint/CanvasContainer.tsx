"use client";

import type React from "react";
import { useState, useRef } from "react";
import { useCanvas } from "../../contexts/CanvasContext";
import TopBar from "./TopBar";
import Toolbar from "./ToolBar";
import ColorPicker from "./ColorPicker";
import Canvas from "./Canvas";

export default function CanvasContainer() {
  const { state } = useCanvas();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (state.isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 dark:bg-black">
        <div className="h-full flex flex-col">
          <TopBar />
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
            {/* Toolbar - Horizontal en móvil, vertical en desktop */}
            <div className="lg:w-20 w-full flex-shrink-0">
              <Toolbar />
            </div>

            {/* Canvas - Área principal */}
            <div className="flex-1 min-h-0">
              <Canvas />
            </div>

            {/* ColorPicker - Abajo en móvil, derecha en desktop */}
            <div className="lg:w-64 w-full flex-shrink-0 dark:bg-black">
              <ColorPicker />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-neutral-950 p-2 sm:p-4 lg:p-8">
      <div
        ref={containerRef}
        className="mx-auto w-full max-w-7xl dark:bg-black backdrop-blur-xl rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <TopBar />
        <div className="flex flex-col lg:flex-row w-full">
          <Toolbar />
          <div className="flex-1">
            <Canvas />
          </div>
          <div className="w-full lg:w-64 dark:bg-black">
            <ColorPicker />
          </div>
        </div>
      </div>
    </div>
  );
}
