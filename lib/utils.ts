import React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  FileIcon,
  FolderIcon,
  ChevronDown,
  PlayCircle,
  CheckCircle,
  FileTextIcon,
  FileImageIcon,
  FileAudioIcon,
  FileVideoIcon,
  BookMarked,
  FileArchiveIcon,
  FileCodeIcon,
  FileSpreadsheetIcon,
  Presentation,
  LinkIcon,
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileIcon(extension: string): string {
  switch (extension.toLowerCase()) {
    case ".pdf":
      return "book-marked";
    case ".txt":
    case ".doc":
    case ".docx":
      return "file-text";
    case ".jpg":
    case ".jpeg":
    case ".png":
    case ".gif":
      return "file-image";
    case ".mp3":
    case ".wav":
      return "file-audio";
    case ".mp4":
    case ".mov":
    case ".avi":
      return "file-video";
    case ".zip":
    case ".rar":
    case ".7z":
      return "file-archive";
    case ".js":
    case ".ts":
    case ".py":
    case ".html":
    case ".css":
      return "file-code";
    case ".xls":
    case ".xlsx":
    case ".csv":
      return "file-spreadsheet";
    case ".ppt":
    case ".pptx":
      return "presentation";
    case ".url":
      return "link";
    default:
      return "file";
  }
}
