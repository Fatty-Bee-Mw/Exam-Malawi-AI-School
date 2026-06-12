import React, { useRef, useState, useEffect } from 'react';
import { 
  PencilIcon, 
  RectangleGroupIcon, 
  StopCircleIcon, // Renamed from CircleIcon
  XMarkIcon,
  TrashIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function DrawingCanvas({ isOpen, onClose, onSendDrawing }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen'); 
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(2);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [isOpen]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const pos = getMousePos(e);
    setStartPos(pos);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // Save state to prevent "ghosting" when drawing shapes
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getMousePos(e);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'pen') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      if (tool === 'line') {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
      } else if (tool === 'rectangle') {
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      }
      ctx.stroke();
    }
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSend = () => {
    if (onSendDrawing) onSendDrawing(canvasRef.current.toDataURL('image/png'));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-secondary rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-dark-muted">
        <div className="flex items-center justify-between p-4 border-b border-dark-muted">
          <h2 className="text-xl font-bold text-white">Geometric Drawing Canvas</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
        </div>

        <div className="flex items-center gap-4 p-4 border-b border-dark-muted bg-dark-accent/30">
          <div className="flex gap-2">
            <button onClick={() => setTool('pen')} className={`p-2 rounded-lg ${tool === 'pen' ? 'bg-dark-neon-purple' : 'bg-dark-primary'}`}><PencilIcon className="h-5 w-5" /></button>
            <button onClick={() => setTool('line')} className={`p-2 rounded-lg ${tool === 'line' ? 'bg-dark-neon-purple' : 'bg-dark-primary'}`}><ArrowRightIcon className="h-5 w-5" /></button>
            <button onClick={() => setTool('rectangle')} className={`p-2 rounded-lg ${tool === 'rectangle' ? 'bg-dark-neon-purple' : 'bg-dark-primary'}`}><RectangleGroupIcon className="h-5 w-5" /></button>
            <button onClick={() => setTool('circle')} className={`p-2 rounded-lg ${tool === 'circle' ? 'bg-dark-neon-purple' : 'bg-dark-primary'}`}><StopCircleIcon className="h-5 w-5" /></button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Size:</span>
            <input type="range" min="1" max="10" value={lineWidth} onChange={(e) => setLineWidth(e.target.value)} className="w-20" />
          </div>
          <button onClick={clearCanvas} className="p-2 rounded-lg bg-dark-primary text-red-400"><TrashIcon className="h-5 w-5" /></button>
        </div>

        <div className="p-4 bg-dark-primary">
          <canvas ref={canvasRef} width={800} height={500} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} className="w-full bg-dark-secondary rounded-lg cursor-crosshair border-2 border-dark-muted" />
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-dark-muted">
          <button onClick={onClose} className="px-6 py-2 bg-dark-muted text-white rounded-lg">Cancel</button>
          <button onClick={handleSend} className="px-6 py-2 bg-dark-neon-purple text-white rounded-lg">Send Drawing</button>
        </div>
      </div>
    </div>
  );
}