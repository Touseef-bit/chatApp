import { useRef } from "react";
// import { useSocket } from "@/context/Socket";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { IoAttach } from "react-icons/io5";
import { uploadFiles } from "@/slices/sendMessageSlice";

interface VoiceUploaderProps {
  onClick?: (e: React.MouseEvent) => void;
}

const FileUpload = ({ onClick }: VoiceUploaderProps) => {
  const selectedUser = useSelector(
    (state: RootState) => state.users.selectedUser
  );
  // const { user } = useSelector((state: RootState) => state.auth);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.(e);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    onClick?.(e);

    const userfiles = e.target.files;
    if (!userfiles || userfiles.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < userfiles.length; i++) {
      formData.append("files", userfiles[i]);
    }

    formData.append("recieverId", selectedUser?._id ?? "");

    dispatch(uploadFiles(formData));
    // if (uploadFiles.fulfilled.match(resultAction)) {
    //   const uploadedFiles = resultAction.payload;

    //   console.log('files',uploadFiles)

    //   if (socket && uploadedFiles.length > 0) {

    //   }
    // }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="*"
        onChange={handleFileUpload}
        ref={fileInputRef}
        className="hidden"
      />
      <IoAttach
        className="text-xl cursor-pointer"
        onClick={handleClick}
        title="Attach files"
      />
    </div>
  );
};

export default FileUpload;
