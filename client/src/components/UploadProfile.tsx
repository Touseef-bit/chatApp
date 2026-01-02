import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import {
  //   Dialog,
  //   DialogContent,
  //   DialogTrigger,
  DialogHeader,
  DialogTitle,
  //   DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { uploadProfilePic } from "@/slices/authSlice";

export default function UploadProfileDialog() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const dipatch = useDispatch<AppDispatch>();
  const { profileLoading } = useSelector((state: RootState) => state.auth);

  const uploadProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };
  const handleUpload = async () => {
    if (!file) return toast.error("No file selected");

    const formData = new FormData();
    formData.append("file", file);
    dipatch(uploadProfilePic(formData));
  };

  return (
    <Card className="flex flex-col items-center justify-center p-6 space-y-4 shadow-none border-none">
      <DialogHeader className="w-full text-center">
        <DialogTitle className="text-lg">Upload Your Image</DialogTitle>
      </DialogHeader>
      <CardContent>
        <div
          className="relative w-40 h-40 rounded-full border-2 border-dashed border-gray-400 overflow-hidden cursor-pointer group"
          onClick={() => fileRef.current?.click()}
        >
          <Input
            type="file"
            ref={fileRef}
            accept="image/*"
            onChange={uploadProfile}
            className="hidden"
          />

          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gray-100 group-hover:bg-gray-200">
              <Camera className="w-6 h-6" />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="w-full flex gap-4 justify-between">
        <DialogClose asChild>
          <Button className="w-1/2" variant="outline">
            Later
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            onClick={handleUpload}
            disabled={profileLoading}
            className="w-1/2"
          >
            {profileLoading ? "Uploading..." : "Upload"}
          </Button>
        </DialogClose>
      </CardFooter>
    </Card>
  );
}
