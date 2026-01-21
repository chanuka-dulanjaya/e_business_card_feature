import { useEffect, useState } from 'react';
import { Mail, Phone, User, Download } from 'lucide-react';
import { employeeApi } from '../lib/api';

interface Employee {
  id: string;
  email: string;
  fullName: string;
  mobileNumber: string | null;
  profilePicture: string | null;
  position: string | null;
  address: string | null;
}

export default function PublicProfile({ employeeId }: { employeeId: string }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      const data = await employeeApi.getById(employeeId);
      setEmployee(data);
    } catch (error) {
      console.error('Error fetching employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadVCard = async () => {
    if (!employee) return;

    // Helper function to get base64 photo data
    const getPhotoBase64 = async (): Promise<{ base64: string; type: string } | null> => {
      if (!employee.profilePicture) return null;

      if (employee.profilePicture.startsWith('data:')) {
        // Base64 image - extract the base64 data and type
        const matches = employee.profilePicture.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,(.+)$/i);
        if (matches) {
          return {
            type: matches[1].toUpperCase() === 'PNG' ? 'PNG' : 'JPEG',
            base64: matches[2]
          };
        }
      } else {
        // URL - try to fetch and convert to base64
        try {
          const response = await fetch(employee.profilePicture);
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
        } catch (error) {
          console.error('Failed to fetch profile picture for vCard:', error);
          return null;
        }
      }
      return null;
    };

    const photoData = await getPhotoBase64();

    // Create vCard content with proper line folding for photo
    let vCard = `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${employee.fullName}\r\nEMAIL:${employee.email}\r\n`;

    if (employee.mobileNumber) {
      vCard += `TEL;TYPE=CELL:${employee.mobileNumber}\r\n`;
    }
    if (employee.position) {
      vCard += `TITLE:${employee.position}\r\n`;
    }
    if (employee.address) {
      vCard += `ADR:;;${employee.address};;;;\r\n`;
    }
    if (photoData) {
      // Use proper vCard 3.0 photo format with line folding (75 char lines)
      const photoHeader = `PHOTO;ENCODING=b;TYPE=${photoData.type}:`;
      const base64Lines = photoData.base64.match(/.{1,72}/g) || [];
      vCard += photoHeader + base64Lines[0] + '\r\n';
      for (let i = 1; i < base64Lines.length; i++) {
        vCard += ' ' + base64Lines[i] + '\r\n';
      }
    }
    vCard += 'END:VCARD';

    // Create blob and download
    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${employee.fullName.replace(/\s+/g, '_')}.vcf`;
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

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Employee not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with video background */}
          <div className="relative px-8 py-12 overflow-hidden">
            {/* Video Background */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/bg.mp4" type="video/mp4" />
            </video>

            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Content - Logo left, Profile right */}
            <div className="relative flex items-start justify-between">
              {/* Logo and tagline - Left aligned (1/3 width for mobile) */}
              <div className="flex-shrink-0 w-1/3 min-w-[120px]">
                <a
                  href="https://overdimetechnologies.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/logo_OD.png"
                    alt="Company Logo"
                    className="h-20 md:h-24 w-auto mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </a>
                <p
                  className="text-white text-[14px] md:text-[16px]"
                  style={{ fontFamily: 'Calibri, sans-serif' }}
                >
                  Supporting Your <br />Digitization Journey
                </p>
                {employee.address && (
                  <p
                    className="text-slate-300 text-[11px] md:text-[12px] mt-2"
                    style={{ fontFamily: 'Calibri, sans-serif' }}
                  >
                    {employee.address}
                  </p>
                )}
              </div>

              {/* Profile info - Right aligned */}
              <div className="flex flex-col items-end text-right">
                {/* Profile picture */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg mb-4">
                  <img
                    src={employee.profilePicture || ''}
                    alt={employee.fullName}
                    className={`w-full h-full object-cover ${!employee.profilePicture ? 'hidden' : ''}`}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const placeholder = document.getElementById('profile-placeholder');
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                    onLoad={(e) => {
                      e.currentTarget.style.display = 'block';
                      const placeholder = document.getElementById('profile-placeholder');
                      if (placeholder) placeholder.style.display = 'none';
                    }}
                  />
                  <div
                    id="profile-placeholder"
                    className={`w-full h-full flex items-center justify-center bg-slate-100 ${employee.profilePicture ? 'hidden' : ''}`}
                  >
                    <User className="w-12 h-12 md:w-16 md:h-16 text-slate-400" />
                  </div>
                </div>

                {/* Name and Position */}
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {employee.fullName}
                </h1>
                {employee.position && (
                  <p className="text-slate-200 text-base md:text-lg">{employee.position}</p>
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
                  href={`mailto:${employee.email}`}
                  className="text-slate-900 hover:text-blue-600 transition-colors underline"
                >
                  {employee.email}
                </a>
              </div>
            </div>

            {employee.mobileNumber && (
              <div className="flex items-start gap-4">
                <div className="bg-slate-100 p-3 rounded-lg">
                  <Phone className="w-5 h-5 text-slate-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-600 font-medium">Mobile</p>
                  <a
                    href={`tel:${employee.mobileNumber}`}
                    className="text-slate-900 hover:text-blue-600 transition-colors underline"
                  >
                    {employee.mobileNumber}
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
