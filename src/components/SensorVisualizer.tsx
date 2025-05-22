
import React, { useRef, useEffect } from 'react';
import { SensorReading } from '@/hooks/useSensors';

type SensorVisualizerProps = {
  readings: SensorReading;
  type: 'accelerometer' | 'gyroscope' | 'magnetometer';
};

const SensorVisualizer: React.FC<SensorVisualizerProps> = ({ readings, type }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set dimensions and center point
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw background
    context.fillStyle = '#f8fafc';
    context.fillRect(0, 0, width, height);
    
    // Draw grid
    context.strokeStyle = '#e2e8f0';
    context.lineWidth = 1;
    
    // Vertical lines
    for (let i = 0; i <= width; i += width / 10) {
      context.beginPath();
      context.moveTo(i, 0);
      context.lineTo(i, height);
      context.stroke();
    }
    
    // Horizontal lines
    for (let i = 0; i <= height; i += height / 10) {
      context.beginPath();
      context.moveTo(0, i);
      context.lineTo(width, i);
      context.stroke();
    }
    
    // Draw center lines
    context.strokeStyle = '#94a3b8';
    context.lineWidth = 2;
    
    // Vertical center line
    context.beginPath();
    context.moveTo(centerX, 0);
    context.lineTo(centerX, height);
    context.stroke();
    
    // Horizontal center line
    context.beginPath();
    context.moveTo(0, centerY);
    context.lineTo(width, centerY);
    context.stroke();
    
    // Set scale factor based on sensor type
    let scaleFactor = 0;
    let fillColor = '';
    switch (type) {
      case 'accelerometer':
        scaleFactor = 10; // Scale for accelerometer values
        fillColor = '#0ea5e9'; // medical-500
        break;
      case 'gyroscope':
        scaleFactor = 2; // Scale for gyroscope values
        fillColor = '#0369a1'; // medical-700
        break;
      case 'magnetometer':
        scaleFactor = 0.5; // Scale for magnetometer values
        fillColor = '#075985'; // medical-800
        break;
    }
    
    // Draw dot representing current reading
    const dotX = centerX + readings.x * scaleFactor;
    const dotY = centerY - readings.y * scaleFactor; // Negative because canvas y-axis is inverted
    
    context.fillStyle = fillColor;
    context.beginPath();
    context.arc(dotX, dotY, 8, 0, 2 * Math.PI);
    context.fill();
    
    // Add a glowing effect
    context.shadowBlur = 10;
    context.shadowColor = fillColor;
    context.fill();
    context.shadowBlur = 0;
    
    // Draw z-axis as a ring size around the dot
    const zScale = Math.abs(readings.z) * scaleFactor / 4;
    context.strokeStyle = fillColor;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(dotX, dotY, 12 + zScale, 0, 2 * Math.PI);
    context.stroke();
    
  }, [readings, type]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={200} 
      height={200} 
      className="w-full max-w-[200px] h-[200px] rounded-lg border border-gray-200 shadow-sm mx-auto"
    />
  );
};

export default SensorVisualizer;
