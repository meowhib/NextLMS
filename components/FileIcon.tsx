import React from "react";
import {
  BookMarked,
  FileText,
  FileImage,
  FileAudio,
  FileVideo,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  Presentation,
  Link,
  File,
} from "lucide-react";

interface FileIconProps {
  iconType: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ iconType }) => {
  const IconComponent =
    {
      "book-marked": BookMarked,
      "file-text": FileText,
      "file-image": FileImage,
      "file-audio": FileAudio,
      "file-video": FileVideo,
      "file-archive": FileArchive,
      "file-code": FileCode,
      "file-spreadsheet": FileSpreadsheet,
      presentation: Presentation,
      link: Link,
      file: File,
    }[iconType] || File;

  return <IconComponent className="mr-2 h-4 w-4" />;
};
