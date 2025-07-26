"use client";
import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface Photo {
  id: string;
  caption: string;
  imageUrl: string
  day: string;
  createdAt: string;
  updatedAt: string;
}

interface EditPhotoProps {
    tripId: string | null;
    day: string;
    label: string;
    onClose: () => void;
    onDelete: (arg: string) => void;
    onEdit: (arg: Photo) => void;
}

export default function EditPhoto({ tripId, day, label, onClose, onDelete, onEdit }: EditPhotoProps) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [pendingDelete, setPendingDelete] = useState<string | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    
    useEffect(() => {
      const fetchPhotos = async () => {
        const res = await fetch(`/api/photos/day?tripId=${tripId}&day=${day}`);
        const data = await res.json();
        setPhotos(data);
      };
      fetchPhotos();
    }, [tripId, day]);

    const handleCaptionChange = async (id: string, newCaption: string) => {
        setPhotos((prev) =>
            prev.map((photo) => (photo.id === id ? { ...photo, caption: newCaption } : photo))
        );
    };

    const handleCaptionSave = async (id: string, caption: string) => {
        try {
            const res = await fetch(`/api/photos/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ caption }),
            });
            const updated = await res.json();
            setPhotos((prev) =>
              prev.map((photo) => (photo.id === id ? updated : photo))
            );
            onEdit(updated);
            if (!res.ok) {
                throw new Error("Failed to update caption");
            }
        } catch (err) {
            console.error("Error updating caption:", err);
            alert("Error saving caption.");
        }
    };

    const confirmDelete = async (id: string) => {
      try {
        const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
        if (!res.ok) {
          throw new Error("Failed to delete photo");
        }
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        onDelete(id);
      } catch (err) {
        console.error("Error deleting photo:", err);
        alert("Failed to delete photo.");
      } finally {
        setPendingDelete(null);
      }
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md w-[90%] max-w-2xl space-y-4 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold">Edit Photos for {label}</h2>
        {/* Image list */}
        {photos.map((photo) => (
          <div key={photo.id} className="mb-6">
            {/* Caption; change on click */}
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={photo.caption}
                onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                className="flex-1 p-2 border border-[#e0c7b1] rounded"
                onBlur={() => handleCaptionSave(photo.id, photo.caption)}
                  onKeyDown={(e) => {
                      if (e.key === "Enter") {
                          e.preventDefault();
                          handleCaptionSave(photo.id, photo.caption);
                      }
                  }}
              />
              {/* Image; delete option */}
              <div className="relative w-24 h-24">
                <Image
                  src={photo.imageUrl}
                  alt={photo.caption}
                  fill
                  onClick={() => setSelectedPhoto(photo)}
                  className="object-cover rounded cursor-pointer transition duration-200 hover:opacity-80"
                />
              </div>
              <button
                onClick={() => setPendingDelete(photo.id)}
                className="text-red-500 hover:underline cursor-pointer text-sm"
              >
                Delete
              </button>
            </div>
            {/* Confirmation */}
            {pendingDelete === photo.id && (
              <div className="bg-white border p-3 rounded shadow text-sm w-fit">
                <p>Delete image?</p>
                <div className="flex justify-center gap-4 space-x-2">
                  <button onClick={() => confirmDelete(photo.id)} className="text-red-600 text-sm cursor-pointer hover:underline">Yes</button>
                  <button onClick={() => setPendingDelete(null)} className="text-sm cursor-pointer hover:underline">No</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {/* Exit button */}
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="text-sm border border-[#784527] px-4 py-1 rounded text-[#784527] hover:bg-blue-50 cursor-pointer">
            Save & Exit
          </button>
        </div>
      </div>
      {/* When choosing a picture; full view */}
      {selectedPhoto && (
          <div
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
              onClick={() => setSelectedPhoto(null)}
          >
              <div
                  className="relative max-w-4xl w-full p-4"
                  onClick={(e) => e.stopPropagation()} 
              >
              <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.caption}
                  className="w-full max-h-[80vh] object-contain rounded-xl"
              />
              <p className="mt-2 text-white text-center text-lg">{selectedPhoto.caption}</p>
              <button
                  className="absolute top-2 right-2 text-white text-2xl"
                  onClick={() => setSelectedPhoto(null)}
              >
                  &times;
              </button>
          </div>
      </div>
      )}
    </div>
    );
}