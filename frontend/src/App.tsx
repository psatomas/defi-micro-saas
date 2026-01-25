import { useState } from "react";
import UploadForm from "./components/UploadForm";
import FileList from "./components/FileList";
import type { FileItemData } from "./types";

const MOCK_UPLOADER = "0xA3F…92B";

export default function App() {
  const [files, setFiles] = useState<FileItemData[]>([]);

  const handleUpload = (file: File) => {
    const newFile: FileItemData = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      uploader: MOCK_UPLOADER,
      downloads: 0,
    };
    setFiles((prev) => [newFile, ...prev]);
  };

  const handleDownload = (id: string) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, downloads: file.downloads + 1 } : file,
      ),
    );
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-start justify-center py-10">
      <div className="max-w-2xl px-4">
        <h1 className="text-3xl font-bold text-center mb-6">
          On-Chain Downloads
        </h1>

        <UploadForm onUpload={handleUpload} />
        <FileList files={files} onDownload={handleDownload} />
      </div>
    </main>
  );
}
