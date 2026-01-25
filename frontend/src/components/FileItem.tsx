import type { FileItemData } from "../types";

interface FileItemProps {
  file: FileItemData;
  onDownload: (id: string) => void;
}

export default function FileItem({ file, onDownload }: FileItemProps) {
  return (
    <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow mb-4">
      <div>
        <strong className="block text-lg font-semibold mb-1">{file.name}</strong>
        <div className="text-sm text-gray-500">
          <span className="mr-3">Uploaded by {file.uploader}</span>
          <span>{file.downloads} downloads</span>
        </div>
      </div>

      <button
        onClick={() => onDownload(file.id)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Download
      </button>
    </div>
  );
}


