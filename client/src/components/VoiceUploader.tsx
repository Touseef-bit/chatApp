import { sendVoiceinRoom } from "@/slices/roomSlice";
import { sendVoice } from "@/slices/sendMessageSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

interface VoiceUploaderProps {
  onClick?: (e: React.MouseEvent) => void;
}

const VoiceUploader = ({ onClick }: VoiceUploaderProps) => {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const { selectedRoom } = useSelector((state: RootState) => state.rooms);
  const { selectedUser } = useSelector((state: RootState) => state.users);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream?.getTracks()?.forEach(track => track.stop());
      }
    };
  }, []);

  const handleVoiceButtonClick = async (e: React.MouseEvent) => {
    onClick?.(e); // Call parent onClick if provided
    e.preventDefault();
    e.stopPropagation();
    
    if (uploading) return;
    
    if (!recording) {
      await startRecording();
    } else {
      await stopRecording();
      setRecording(false);
    }
  };

  const startRecording = async () => {
    if (mediaRecorderRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(100);
      setRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const stopRecording = async () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;

    setUploading(true);
    
    try {
      await new Promise<void>((resolve) => {
        mediaRecorder.onstop = async () => {
          try {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            
            if (audioBlob.size > 0) {
              const formData = new FormData();
              formData.append("file", audioBlob, "voice-message.webm");

              if (selectedRoom) {
                await dispatch(sendVoiceinRoom(formData)).unwrap();
              } else if (selectedUser) {
                await dispatch(sendVoice(formData)).unwrap();
              }
            }
          } catch (error) {
            console.error("Error uploading voice:", error);
          } finally {
            mediaRecorderRef.current = null;
            audioChunksRef.current = [];
            mediaRecorder.stream?.getTracks()?.forEach(track => track.stop());
            resolve();
          }
        };

        mediaRecorder.requestData();
        mediaRecorder.stop();
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <button
      onClick={handleVoiceButtonClick}
      disabled={uploading}
      className={`cursor-pointer ${
        recording ? "bg-red-600" : "bg-green-500"
      } ${uploading ? "opacity-50" : ""} text-white rounded-full p-1 flex items-center justify-center`}
    >
      {uploading ? (
        <span className="animate-spin">⏳</span>
      ) : recording ? (
        <FaStop />
      ) : (
        <FaMicrophone />
      )}
    </button>
  );
};

export default VoiceUploader;