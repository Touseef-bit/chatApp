"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Camera, Check, X, Video, VideoOff } from "lucide-react";
import { toast } from "react-toastify";
import { uploadFiles } from "@/slices/sendMessageSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";

export function CameraModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isOpen && !photo && !recordedVideo) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, photo, recordedVideo, mode]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true, 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        if (mode === 'video') {
          mediaRecorderRef.current = new MediaRecorder(stream);
          mediaRecorderRef.current.ondataavailable = handleDataAvailable;
          mediaRecorderRef.current.onstop = handleStop;
        }
      }
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Could not access camera");
    }
  };

  const stopCamera = () => {
    if (isRecording) {
      stopRecording();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    setPhoto(canvas.toDataURL("image/jpeg"));
  };

  const startRecording = () => {
    if (mediaRecorderRef.current) {
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDataAvailable = (e: BlobEvent) => {
    if (e.data.size > 0) {
      recordedChunksRef.current.push(e.data);
    }
  };

  const handleStop = () => {
    const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/mp4' });
    const videoUrl = URL.createObjectURL(videoBlob);
    setRecordedVideo(videoUrl);
  };

  const retake = () => {
    setPhoto(null);
    setRecordedVideo(null);
    startCamera();
  };

  const handleSend = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const formData = new FormData();
      
      if (photo) {
        const blob = await fetch(photo).then((res) => res.blob());
        formData.append("files", blob, 'photo.jpg');
      } else if (recordedVideo) {
        const videoBlob = await fetch(recordedVideo).then((res) => res.blob());
        formData.append("files", videoBlob, 'video.mp4');
      } else {
        return;
      }
      
      dispatch(uploadFiles(formData));
      setIsOpen(false);
      setPhoto(null);
      setRecordedVideo(null);
    } catch (error) {
      toast.error("Failed to send media");
      console.error("Upload error:", error);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'photo' ? 'video' : 'photo');
    setPhoto(null);
    setRecordedVideo(null);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className="text-gray-600 hover:text-primary"
      >
        <Camera className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {mode === 'photo' ? 'Take a photo' : 'Record a video'}
            </DialogTitle>
          </DialogHeader>

          <div className="relative">
            {!photo && !recordedVideo ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg"
                style={{ transform: "scaleX(-1)" }}
              />
            ) : photo ? (
              <img
                src={photo}
                alt="Preview"
                className="w-full rounded-lg"
                style={{ transform: "scaleX(-1)" }}
              />
            ) : (
              <video
                src={recordedVideo ? recordedVideo : undefined}
                controls
                className="w-full rounded-lg"
                style={{ transform: "scaleX(-1)" }}
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" className="cursor-pointer hover:bg-gray-300" onClick={toggleMode}>
              {mode === 'photo' ? (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Switch to Video
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Switch to Photo
                </>
              )}
            </Button>
            
            {!photo && !recordedVideo ? (
              mode === 'photo' ? (
                <Button onClick={takePhoto} size="lg">
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
              ) : (
                <Button 
                  onClick={isRecording ? stopRecording : startRecording} 
                  size="lg"
                  variant={isRecording ? "destructive" : "default"}
                >
                  {isRecording ? (
                    <>
                      <VideoOff className="mr-2 h-4 w-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Start Recording
                    </>
                  )}
                </Button>
              )
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={retake}>
                  <X className="mr-2 h-4 w-4" />
                  Retake
                </Button>
                <Button onClick={handleSend}>
                  <Check className="mr-2 h-4 w-4" />
                  Send {mode === 'photo' ? 'Photo' : 'Video'}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}