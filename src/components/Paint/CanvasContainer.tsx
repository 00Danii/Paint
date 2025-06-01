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
      <div className="fixed inset-0 z-50 ">
        <div className="h-full flex flex-col">
          <TopBar />
          <div className="flex-1  flex">
            <Toolbar />
            <Canvas />
            <div className="w-64 flex flex-col dark:bg-black">
              <ColorPicker />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-neutral-950 p-4 lg:p-8">
      <div
        ref={containerRef}
        className="mx-auto max-w-7xl dark:bg-black backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
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
        <div className="flex flex-col lg:flex-row ">
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
