"use client";
import React from "react";
import { useState } from "react";

interface Photo {
  id: string;
  caption: string;
  imageUrl: string
  day: string;
  createdAt: string;
  updatedAt: string;
}

interface UploadPhotoProps {
    day: string;
    tripId: string | null;
    onClose: () => void;
    onUpload: (arg: Photo) => void;
}

export default function UploadPhoto({ day, tripId, onClose, onUpload }: UploadPhotoProps) {
    const [file, setFile] = useState<File | null>(null);
    const [caption, setCaption] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("tripId", tripId ?? "");
            formData.append("file", file);
            formData.append("caption", caption);
            formData.append("day", day);

            const res = await fetch("/api/photos", {
                method: "POST",
                body: formData,
            });

            const responseText = await res.text(); // read once
            let data;
            try {
              data = JSON.parse(responseText);
            } catch {
              console.error("Upload error (non-JSON):", responseText);
              alert("Upload failed: " + responseText);
              return;
            }

            if (res.ok) {
              onUpload(data);
              alert("Upload successful!");
              onClose();
            } else {
                console.error("Upload error (JSON):", data);
                alert("Upload failed: " + (data?.error || "Unknown error."));
              }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Error uploading photo.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md w-[90%] max-w-md">
        <h2 className="text-lg font-bold mb-4">Upload Photo</h2>
        <input
          type="text"
          placeholder="Enter a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full p-2 border border-[#e0c7b1] rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 cursor-pointer file:mr-4 file:py-2 file:px-4 file:text-sm file:bg-[#e6ccb2] file:cursor-pointer file:text-[#432818] hover:file:bg-[#d9bfa5]"
        />
        <div className="flex justify-end space-x-2 mt-5 gap-4">
          <button
            onClick={onClose}
            className="text-sm px-3 py-1 rounded border border-[#784527] text-[#784527] cursor-pointer transition duration-200 hover:bg-blue-100"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="text-sm px-3 py-1 rounded bg-[#e6ccb2] hover:bg-[#d9bfa5] text-[#432818] cursor-pointer"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}