import FileItem from "./FileItem";
import type { FileItemData } from "../types";

interface FileListProps {
  files: FileItemData[];
  onDownload: (id: string) => void;
}

export default function FileList({ files, onDownload }: FileListProps) {
  if (files.length === 0) {
    return (
      <p className="text-gray-500 text-center mt-8">
        No files uploaded yet.
      </p>
    );
  }

  return (
    <section className="mt-6">
      <h2 className="text-2xl font-bold mb-4">Available Files</h2>

      <div className="space-y-4">
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onDownload={onDownload}
          />
        ))}
      </div>
    </section>
  );
}


