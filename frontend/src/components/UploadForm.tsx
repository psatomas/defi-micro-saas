interface UploadFormProps {
  onUpload: (file: File) => void;
}

export default function UploadForm({ onUpload }: UploadFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;

    const file = fileInput.files?.[0];
    if (!file) return;

    onUpload(file);
    form.reset();
  };

  return (
    <section className="p-6 bg-white rounded-lg shadow mb-6">
      <h2 className="text-2xl font-bold mb-4">Upload File</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          name="file"
          required
          className="border border-gray-300 rounded px-3 py-2"
        />

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Upload
        </button>
      </form>
    </section>
  );
}


