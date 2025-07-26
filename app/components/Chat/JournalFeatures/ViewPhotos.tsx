"use client";
import React from "react";
import { useEffect, useState } from "react";

interface Photo {
  id: string;
  caption: string;
  imageUrl: string
  day: string;
  createdAt: string;
  updatedAt: string;
}

interface ViewPhotosProps {
    tripId: string | null;
    day: string | null;
    label: string | null;
    onClose: () => void;
}

export default function ViewPhotos({ tripId, day, label, onClose }: ViewPhotosProps) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const res = await fetch(`/api/photos/day?tripId=${tripId}&day=${day}`);
                if (!res.ok) throw new Error("Failed to fetch photos");
                const data = await res.json();
                setPhotos(data);
            } catch (err: any) {
                console.error("Error loading photos: ", err);
            }
        };
        fetchPhotos();
    }, [tripId, day]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Photos for {label}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                    <div key={photo.id} className="flex flex-col items-center">
                    <img
                        src={photo.imageUrl}
                        alt="Uploaded"
                        className="w-full h-40 object-cover rounded-lg cursor-pointer transition duration-200 hover:opacity-80"
                        onClick={() => setSelectedPhoto(photo)}
                    />
                    <p className="mt-2 text-sm text-gray-600 text-center break-words">
                        {photo.caption}
                    </p>
                    </div>
                ))}
                </div>
                <button
                    onClick={onClose}
                    className="mt-6 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 cursor-pointer"
                >
                Close
                </button>
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