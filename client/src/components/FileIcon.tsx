import {
    FileIcon,
    FileText,
    FileArchive,
    FileAudio,
    FileVideo,
    FileImage,
    FileSpreadsheet,
    FileCode
} from "lucide-react";

interface FileIconProps {
    mimetype: string;
    className?: string;
}

const FileIconComponent = ({ mimetype, className = "h-8 w-8" }: FileIconProps) => {
    if (mimetype.startsWith("image/")) {
        return <FileImage className={`${className} text-blue-500`} />;
    }
    if (mimetype.startsWith("video/")) {
        return <FileVideo className={`${className} text-purple-500`} />;
    }
    if (mimetype.startsWith("audio/")) {
        return <FileAudio className={`${className} text-pink-500`} />;
    }
    if (mimetype.includes("pdf")) {
        return <FileText className={`${className} text-red-500`} />;
    }
    if (mimetype.includes("zip") || mimetype.includes("rar") || mimetype.includes("archive")) {
        return <FileArchive className={`${className} text-orange-500`} />;
    }
    if (mimetype.includes("word") || mimetype.includes("officedocument.wordprocessingml")) {
        return <FileText className={`${className} text-blue-700`} />;
    }
    if (mimetype.includes("excel") || mimetype.includes("spreadsheetml")) {
        return <FileSpreadsheet className={`${className} text-green-700`} />;
    }
    if (mimetype.includes("javascript") || mimetype.includes("json") || mimetype.includes("html") || mimetype.includes("css")) {
        return <FileCode className={`${className} text-yellow-600`} />;
    }

    return <FileIcon className={`${className} text-gray-500`} />;
};

export default FileIconComponent;
