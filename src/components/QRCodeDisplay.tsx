import { useEffect, useRef } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';
import type { Employee } from '../contexts/AuthContext';

interface QRCodeDisplayProps {
  employee: Employee;
}

export default function QRCodeDisplay({ employee }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const profileUrl = `${window.location.origin}/profile/${employee.id}`;

  const generateQRCode = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Generate a real, scannable QR code using qrcode library
      await QRCode.toCanvas(canvas, profileUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H' // High error correction for better scanning
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  useEffect(() => {
    generateQRCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee.id, profileUrl]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${employee.fullName.replace(/\s+/g, '_')}_BusinessCard_QR.png`;
    link.href = url;
    link.click();
  };

  const handleOpenProfile = () => {
    window.open(profileUrl, '_blank');
  };

  return (
    <div className="text-center">
      <h3 className="text-xl font-bold text-slate-900 mb-2">
        {employee.fullName}
      </h3>
      <p className="text-sm text-slate-600 mb-6">
        Scan to view business card
      </p>

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
            {profileUrl}
          </p>
        </div>
      </div>
    </div>
  );
}
