import { useEffect, useRef } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  showControls?: boolean;
  title?: string;
  downloadFileName?: string;
}

export default function QRCodeDisplay({
  value,
  size = 300,
  showControls = false,
  title,
  downloadFileName = 'BusinessCard_QR'
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      await QRCode.toCanvas(canvas, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [value, size]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${downloadFileName}.png`;
    link.href = url;
    link.click();
  };

  const handleOpenProfile = () => {
    window.open(value, '_blank');
  };

  if (!showControls) {
    return (
      <div className="text-center">
        <div className="bg-white p-2 rounded-lg border border-slate-200 inline-block">
          <canvas ref={canvasRef} style={{ width: size, height: size }} />
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      {title && (
        <>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            Scan to view business card
          </p>
        </>
      )}

      <div className="bg-white p-4 rounded-xl border-2 border-slate-200 inline-block mb-6">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      <div className="space-y-3">
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download QR Code
        </button>

        <button
          onClick={handleOpenProfile}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-900 border-2 border-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Preview Business Card
        </button>

        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-600 mb-1">Business Card URL</p>
          <p className="text-sm font-mono text-slate-900 break-all">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
