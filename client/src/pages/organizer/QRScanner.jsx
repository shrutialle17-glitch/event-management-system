import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import axiosInstance from '../../api/axiosInstance';
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, Search, ScanLine, Keyboard } from 'lucide-react';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualTicketId, setManualTicketId] = useState('');
  const [mode, setMode] = useState('scan');
  const scannerRef = useRef(null);
  const scannerDivId = 'qr-reader-container';

  // Initialize once and keep in DOM
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      scannerDivId,
      {
        fps: 10,
        qrbox: { width: 260, height: 260 },
        supportedScanTypes: [
          Html5QrcodeScanType.SCAN_TYPE_CAMERA,
          Html5QrcodeScanType.SCAN_TYPE_FILE,
        ],
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
      },
      /* verbose= */ false
    );
    scannerRef.current = scanner;
    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  const onScanSuccess = async (decodedText) => {
    if (isProcessing) return;
    try { scannerRef.current?.pause(true); } catch (_) {}
    setIsProcessing(true);
    setScanResult(null);
    try {
      const res = await axiosInstance.post('/qr/validate', { qrToken: decodedText });
      setTicketData({ ...res.data.data.registration, rawToken: decodedText });
      setScanResult('success');
      setManualTicketId('');
    } catch (err) {
      if (err.response?.status === 409) {
        setScanResult('duplicate');
        setTicketData(err.response.data.errors?.registration || null);
      } else {
        setScanResult('invalid');
        setTicketData(null);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualTicketId.trim()) { toast.error('Please enter a Ticket ID'); return; }
    onScanSuccess(manualTicketId.trim());
  };

  const onScanFailure = () => {};

  const handleCheckIn = async () => {
    if (!ticketData?.rawToken) return;
    setIsProcessing(true);
    try {
      await axiosInstance.post('/qr/checkin', { qrToken: ticketData.rawToken });
      toast.success('Check-in confirmed! ✓');
      resetScanner();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setTicketData(null);
    setManualTicketId('');
    try { scannerRef.current?.resume(); } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100" style={{ boxShadow: '0 1px 0 rgba(15,23,42,0.06)' }}>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Link to="/organizer" className="inline-flex items-center gap-1.5 text-sm text-textMuted hover:text-primary font-medium transition-colors mb-4 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
            >
              <ScanLine className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">QR Ticket Scanner</h1>
              <p className="text-sm text-textMuted">Scan a QR code or enter a Ticket ID manually</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Mode Toggle */}
        <div className="flex bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm mb-6 w-fit">
          {[
            { key: 'scan',   label: 'Camera Scan',  icon: <ScanLine className="w-4 h-4" /> },
            { key: 'manual', label: 'Manual Entry',  icon: <Keyboard className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setMode(tab.key)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={
                mode === tab.key
                  ? { background: 'linear-gradient(135deg,#10b981,#06b6d4)', color: 'white', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }
                  : { color: '#64748b' }
              }
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Result View — shown above scanner when result exists */}
        {scanResult && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card mb-6 overflow-hidden">
            <div className="p-10 flex flex-col items-center text-center">
              {scanResult === 'success' && (
                <>
                  <div className="w-24 h-24 bg-green-100 text-green-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Valid Ticket!</h2>
                  <p className="text-textMuted mb-6 text-sm">Ready to confirm check-in.</p>
                  {ticketData && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 w-full max-w-xs mb-6 text-left space-y-3">
                      <div>
                        <p className="text-xs text-textMuted font-semibold uppercase tracking-wider mb-0.5">Attendee</p>
                        <p className="font-bold text-slate-900">{ticketData.user?.name}</p>
                        <p className="text-xs text-textMuted">{ticketData.user?.email}</p>
                      </div>
                      <div className="border-t border-slate-200 pt-3">
                        <p className="text-xs text-textMuted font-semibold uppercase tracking-wider mb-0.5">Event</p>
                        <p className="font-semibold text-slate-900">{ticketData.event?.title}</p>
                      </div>
                      <div className="border-t border-slate-200 pt-3 flex justify-between">
                        <span className="text-xs text-textMuted font-semibold">Ticket ID</span>
                        <span className="font-mono text-sm font-bold text-slate-700">{ticketData.ticketId}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 w-full max-w-xs">
                    <Button variant="outline" className="flex-1" onClick={resetScanner}>Cancel</Button>
                    <Button className="flex-1" onClick={handleCheckIn} isLoading={isProcessing}>Confirm Check-in</Button>
                  </div>
                </>
              )}
              {scanResult === 'duplicate' && (
                <>
                  <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-3xl flex items-center justify-center mb-6">
                    <AlertTriangle className="w-12 h-12" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Already Checked In</h2>
                  <p className="text-textMuted mb-8 text-sm">This ticket has already been used.</p>
                  <Button onClick={resetScanner}>Scan Next Ticket</Button>
                </>
              )}
              {scanResult === 'invalid' && (
                <>
                  <div className="w-24 h-24 bg-red-100 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                    <XCircle className="w-12 h-12" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Invalid Ticket</h2>
                  <p className="text-textMuted mb-8 text-sm">Not recognised or doesn't belong to your events.</p>
                  <Button onClick={resetScanner}>Try Again</Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Scanner Card — always keep in DOM so html5-qrcode stays mounted */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">

          {/* Camera Scan panel */}
          <div style={{ display: mode === 'scan' ? 'block' : 'none' }}>
            {/* The html5-qrcode library fills this div with its own camera UI */}
            <div id={scannerDivId} className="w-full" style={{ minHeight: 400 }} />
          </div>

          {/* Manual Entry panel */}
          {mode === 'manual' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white"
                     style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)' }}>
                  <Keyboard className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Manual Check-In</h3>
                <p className="text-sm text-textMuted max-w-sm mx-auto">
                  Enter the attendee's Ticket ID to check them in without scanning a QR code.
                </p>
              </div>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. TKT-ABC123"
                    className="w-full pl-11 pr-4 py-4 border-2 border-slate-200 rounded-2xl text-center font-mono text-xl font-bold text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-400 placeholder:text-base placeholder:font-normal"
                    value={manualTicketId}
                    onChange={e => setManualTicketId(e.target.value.toUpperCase())}
                  />
                </div>
                <Button type="submit" className="w-full py-4 text-base rounded-2xl" isLoading={isProcessing}>
                  <Search className="w-5 h-5" /> Validate & Check-In
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
