import { useState, useEffect, useRef, FormEvent } from 'react';
import { BrowserQRCodeReader, IScannerControls, BrowserCodeReader } from '@zxing/browser';
import { Camera, CameraOff, Sparkles, CheckCircle2, AlertTriangle, X, RefreshCw, Award, ArrowRight, UserCheck, Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export interface ReceptionScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicId: string;
  clinicName?: string;
  onCheckInSuccess?: (result: CheckInResult) => void;
}

export interface CheckInResult {
  client_id: string;
  client_name: string;
  reward_points: number;
  tier: string;
  points_awarded: number;
  checked_in_at: string;
  checkin_id?: string;
}

export default function ReceptionScannerModal({
  isOpen,
  onClose,
  clinicId,
  clinicName = 'Nexcore Aesthetics',
  onCheckInSuccess,
}: ReceptionScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [celebrationData, setCelebrationData] = useState<CheckInResult | null>(null);

  // Manual fallback input
  const [manualClientId, setManualClientId] = useState('');

  // 1. Enumerate video cameras
  useEffect(() => {
    if (!isOpen) return;

    BrowserCodeReader.listVideoInputDevices()
      .then((devices) => {
        setVideoDevices(devices);
        if (devices.length > 0) {
          // Prefer environment/back camera if labeled, or default to first
          const preferred = devices.find((d) =>
            d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment')
          ) || devices[0];
          setSelectedDeviceId(preferred.deviceId);
        }
      })
      .catch((err) => {
        console.warn('Camera device enumeration error:', err);
      });
  }, [isOpen]);

  // 2. Start Scanner Stream
  const startScanning = async (deviceId?: string) => {
    if (!videoRef.current) return;
    stopScanning();

    setErrorMessage(null);
    setCelebrationData(null);

    try {
      const codeReader = new BrowserQRCodeReader();
      const targetDeviceId = deviceId || selectedDeviceId || undefined;

      const controls = await codeReader.decodeFromVideoDevice(
        targetDeviceId,
        videoRef.current,
        (result) => {
          if (result && !isProcessing) {
            handleDecodedText(result.getText());
          }
        }
      );

      controlsRef.current = controls;
      setIsStreaming(true);
    } catch (err: any) {
      console.error('Failed to start camera scanner:', err);
      setErrorMessage(err?.message || 'Unable to access camera. Please allow camera permissions.');
      setIsStreaming(false);
    }
  };

  // 3. Stop Scanner Stream
  const stopScanning = () => {
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch (e) {
        console.warn('Error stopping scanner controls:', e);
      }
      controlsRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  // Lifecycle stream control
  useEffect(() => {
    if (isOpen) {
      startScanning(selectedDeviceId);
    } else {
      stopScanning();
      setCelebrationData(null);
      setErrorMessage(null);
      setManualClientId('');
    }

    return () => {
      stopScanning();
    };
  }, [isOpen, selectedDeviceId]);

  // 4. Handle Decoded Payload
  const handleDecodedText = async (rawText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      let extractedClientId: string | null = null;
      let targetClinicId = clinicId;

      // Handle JSON payload: {"cid": "...", "uid": "...", "ts": 1234}
      if (rawText.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(rawText.trim());
          extractedClientId = parsed.uid || parsed.client_id || parsed.id || null;
          if (parsed.cid && parsed.cid !== clinicId) {
            targetClinicId = parsed.cid;
          }
        } catch (_) {
          // not valid json, fallback to raw
        }
      }

      // Handle URI scheme: nexcore://patient?id=UUID&clinic=UUID
      if (!extractedClientId && rawText.includes('://')) {
        try {
          const url = new URL(rawText);
          extractedClientId = url.searchParams.get('id') || url.searchParams.get('uid');
          const clinicParam = url.searchParams.get('clinic') || url.searchParams.get('cid');
          if (clinicParam) targetClinicId = clinicParam;
        } catch (_) {}
      }

      // Handle plain UUID string
      if (!extractedClientId) {
        const uuidMatch = rawText.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
        if (uuidMatch) {
          extractedClientId = uuidMatch[0];
        } else {
          extractedClientId = rawText.trim();
        }
      }

      if (!extractedClientId) {
        throw new Error('Invalid barcode format. Expected patient VIP pass.');
      }

      // Call Supabase RPC
      await executeCheckIn(targetClinicId, extractedClientId);
    } catch (err: any) {
      console.error('Check-in decode error:', err);
      const msg = err?.message?.replace(/^[A-Z_]+:s*/, '') || 'Check-in processing failed.';
      setErrorMessage(msg);
      // Auto clear error after 5s so scanner can resume
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Execute Check-In RPC
  const executeCheckIn = async (cId: string, clientId: string) => {
    const { data, error } = await supabase.rpc('process_patient_checkin', {
      p_clinic_id: cId,
      p_client_id: clientId,
    });

    if (error) {
      throw error;
    }

    const payload: CheckInResult = data as CheckInResult;
    setCelebrationData(payload);
    if (onCheckInSuccess) {
      onCheckInSuccess(payload);
    }
  };

  // 6. Manual Check-in Handler
  const handleManualSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!manualClientId.trim() || isProcessing) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      await executeCheckIn(clinicId, manualClientId.trim());
      setManualClientId('');
    } catch (err: any) {
      const msg = err?.message?.replace(/^[A-Z_]+:s*/, '') || 'Check-in failed. Please verify the client ID.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Reception Desk Scanner</h2>
              <p className="text-xs text-slate-400">{clinicName} • VIP In-Clinic Check-In</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* CELEBRATION TOAST / CARD */}
          {celebrationData && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A1F2C] to-[#0E131F] border border-amber-500/40 p-5 shadow-[0_0_40px_rgba(212,175,55,0.2)] animate-in zoom-in-95 duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md">
                  <Award className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Check-in Verified
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1 truncate">
                    {celebrationData.client_name}
                  </h3>
                  <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                    <span>Tier: <strong className="text-amber-300">{celebrationData.tier}</strong></span>
                    <span>•</span>
                    <span>Points Balance: <strong className="text-white">{celebrationData.reward_points}</strong></span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm tracking-tight inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    +{celebrationData.points_awarded} pts
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  ID: {celebrationData.client_id.substring(0, 8)}...
                </span>
                <button
                  onClick={() => setCelebrationData(null)}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Scan Next Patient</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="rounded-xl bg-red-950/40 border border-red-800/60 p-4 text-red-300 flex items-start gap-3 animate-in shake duration-200">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs leading-relaxed">
                <strong className="font-semibold block text-red-200">Check-in Error</strong>
                {errorMessage}
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* VIDEO VIEWFINDER CONTAINER */}
          <div className="relative aspect-video w-full rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Viewfinder Target Mask */}
            {isStreaming && !celebrationData && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-52 h-52 border-2 border-amber-400/40 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-amber-400 rounded-tl-sm" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-amber-400 rounded-tr-sm" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-amber-400 rounded-bl-sm" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-amber-400 rounded-br-sm" />

                  {/* Scanning beam animation */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#d4af37] animate-pulse" />
                </div>
              </div>
            )}

            {/* Offline / Stopped State */}
            {!isStreaming && (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <CameraOff className="w-8 h-8" />
                <p className="text-xs">Camera stream stopped</p>
                <button
                  onClick={() => startScanning(selectedDeviceId)}
                  className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700"
                >
                  Restart Camera
                </button>
              </div>
            )}

            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-amber-400 gap-2">
                <RefreshCw className="w-7 h-7 animate-spin" />
                <span className="text-xs font-semibold tracking-wide">Processing VIP Check-In...</span>
              </div>
            )}
          </div>

          {/* CAMERA CONTROLS BAR */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1">
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full max-w-[240px] px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-amber-500"
              >
                {videoDevices.map((dev, idx) => (
                  <option key={dev.deviceId || idx} value={dev.deviceId}>
                    {dev.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              {isStreaming ? (
                <button
                  onClick={stopScanning}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                >
                  <CameraOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={() => startScanning(selectedDeviceId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </button>
              )}
            </div>
          </div>

          {/* MANUAL CLIENT ID INPUT FALLBACK */}
          <div className="border-t border-slate-800/80 pt-5">
            <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Manual Patient ID Fallback</span>
            </h4>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter client UUID or phone / email..."
                  value={manualClientId}
                  onChange={(e) => setManualClientId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
              <button
                type="submit"
                disabled={isProcessing || !manualClientId.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Check In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
