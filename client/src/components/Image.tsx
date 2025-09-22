import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { api } from "@/lib/api.instance";

interface ImageProps {
  fallback?: string;
  url?: string | null;
}

const Image: React.FC<ImageProps> = ({
  fallback = "NA",
  url,
}) => {
  // const [preview, setPreview] = useState<string>(defaultSrc);
  // const fileInputRef = useRef<HTMLInputElement | null>(null);
  // const picUrl = localStorage.getItem("url");

  // const handleAvatarClick = () => {
  //   if (canUpload) {
  //     fileInputRef.current?.click();
  //   }
  // };

  // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   const previewUrl = URL.createObjectURL(file);
  //   setPreview(previewUrl);

  //   if (canUpload) {
  //     const formData = new FormData();
  //     formData.append("profile", file);
  //     const token = localStorage.getItem("token");
  //     try {
  //       const res = await api.post(uploadEndpoint, formData, {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       localStorage.setItem("url", res.data.url);
  //     } catch (err) {
  //       console.error("Upload failed:", err);
  //     }
  //   }
  // };

  return (
    <>
      <Avatar
      // onClick={handleAvatarClick}
      // className={canUpload ? "cursor-pointer hover:opacity-80" : ""}
      >
        <AvatarImage src={url || undefined} alt="User Avatar" />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
    </>
  );
};

export default Image;
