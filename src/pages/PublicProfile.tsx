import { useEffect, useState } from 'react';
import { Mail, Phone, User, Download, Building2 } from 'lucide-react';
import { businessCardApi } from '../lib/api';

interface BusinessCard {
  _id: string;
  email: string;
  fullName: string;
  phone?: string;
  mobileNumber?: string;
  profilePicture?: string;
  position?: string;
  company?: string;
  address?: string;
  website?: string;
}

export default function PublicProfile({ employeeId }: { employeeId: string }) {
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessCard();
  }, [employeeId]);

  const fetchBusinessCard = async () => {
    try {
      const data = await businessCardApi.getPublic(employeeId);
      setCard(data.card);
    } catch (err) {
      console.error('Error fetching business card:', err);
      setError('Business card not found or is private');
    } finally {
      setLoading(false);
    }
  };

  const downloadVCard = async () => {
    if (!card) return;

    // Helper function to get base64 photo data
    const getPhotoBase64 = async (): Promise<{ base64: string; type: string } | null> => {
      if (!card.profilePicture) return null;

      if (card.profilePicture.startsWith('data:')) {
        const matches = card.profilePicture.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,(.+)$/i);
        if (matches) {
          return {
            type: matches[1].toUpperCase() === 'PNG' ? 'PNG' : 'JPEG',
            base64: matches[2]
          };
        }
      } else {
        try {
          const response = await fetch(card.profilePicture);
          const blob = await response.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              const matches = result.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,(.+)$/i);
              if (matches) {
                resolve({
                  type: matches[1].toUpperCase() === 'PNG' ? 'PNG' : 'JPEG',
                  base64: matches[2]
                });
              } else {
                resolve(null);
              }
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          });
        } catch (err) {
          console.error('Failed to fetch profile picture for vCard:', err);
          return null;
        }
      }
      return null;
    };

    const photoData = await getPhotoBase64();

    // Create vCard content
    let vCard = `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${card.fullName}\r\nEMAIL:${card.email}\r\n`;

    if (card.phone) {
      vCard += `TEL;TYPE=WORK:${card.phone}\r\n`;
    }
    if (card.mobileNumber) {
      vCard += `TEL;TYPE=CELL:${card.mobileNumber}\r\n`;
    }
    if (card.position) {
      vCard += `TITLE:${card.position}\r\n`;
    }
    if (card.company) {
      vCard += `ORG:${card.company}\r\n`;
    }
    if (card.address) {
      vCard += `ADR:;;${card.address};;;;\r\n`;
    }
    if (card.website) {
      vCard += `URL:${card.website}\r\n`;
    }
    if (photoData) {
      const photoHeader = `PHOTO;ENCODING=b;TYPE=${photoData.type}:`;
      const base64Lines = photoData.base64.match(/.{1,72}/g) || [];
      vCard += photoHeader + base64Lines[0] + '\r\n';
      for (let i = 1; i < base64Lines.length; i++) {
        vCard += ' ' + base64Lines[i] + '\r\n';
      }
    }
    vCard += 'END:VCARD';

    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${card.fullName.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-2">Business card not found</div>
          <p className="text-slate-400">This card may be private or doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with gradient background */}
          <div className="relative px-8 py-12 bg-gradient-to-br from-slate-800 to-slate-900">
            {/* Content */}
            <div className="relative flex items-start justify-between">
              {/* Company info - Left aligned */}
              <div className="flex-shrink-0 w-1/3 min-w-[120px]">
                {card.company && (
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-5 h-5 text-slate-300" />
                    <span className="text-white font-medium">{card.company}</span>
                  </div>
                )}
                {card.address && (
                  <p className="text-slate-300 text-sm mt-2">
                    {card.address}
                  </p>
                )}
              </div>

              {/* Profile info - Right aligned */}
              <div className="flex flex-col items-end text-right">
                {/* Profile picture */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg mb-4">
                  {card.profilePicture ? (
                    <img
                      src={card.profilePicture}
                      alt={card.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full flex items-center justify-center bg-slate-100 ${card.profilePicture ? 'hidden' : ''}`}
                  >
                    <User className="w-12 h-12 md:w-16 md:h-16 text-slate-400" />
                  </div>
                </div>

                {/* Name and Position */}
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {card.fullName}
                </h1>
                {card.position && (
                  <p className="text-slate-200 text-base md:text-lg">{card.position}</p>
                )}
              </div>
            </div>
          </div>

          <div className="px-8 py-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-slate-100 p-3 rounded-lg">
                <Mail className="w-5 h-5 text-slate-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600 font-medium">Email</p>
                <a
                  href={`mailto:${card.email}`}
                  className="text-slate-900 hover:text-blue-600 transition-colors underline"
                >
                  {card.email}
                </a>
              </div>
            </div>

            {card.phone && (
              <div className="flex items-start gap-4">
                <div className="bg-slate-100 p-3 rounded-lg">
                  <Phone className="w-5 h-5 text-slate-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-600 font-medium">Phone</p>
                  <a
                    href={`tel:${card.phone}`}
                    className="text-slate-900 hover:text-blue-600 transition-colors underline"
                  >
                    {card.phone}
                  </a>
                </div>
              </div>
            )}

            {card.mobileNumber && (
              <div className="flex items-start gap-4">
                <div className="bg-slate-100 p-3 rounded-lg">
                  <Phone className="w-5 h-5 text-slate-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-600 font-medium">Mobile</p>
                  <a
                    href={`tel:${card.mobileNumber}`}
                    className="text-slate-900 hover:text-blue-600 transition-colors underline"
                  >
                    {card.mobileNumber}
                  </a>
                </div>
              </div>
            )}

            {card.website && (
              <div className="flex items-start gap-4">
                <div className="bg-slate-100 p-3 rounded-lg">
                  <Building2 className="w-5 h-5 text-slate-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-600 font-medium">Website</p>
                  <a
                    href={card.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-900 hover:text-blue-600 transition-colors underline"
                  >
                    {card.website}
                  </a>
                </div>
              </div>
            )}

            <button
              onClick={downloadVCard}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors mt-8"
            >
              <Download className="w-5 h-5" />
              Save to Contacts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
