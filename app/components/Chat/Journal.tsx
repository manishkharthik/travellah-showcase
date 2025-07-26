"use client";
import React from "react";
import { useState, useEffect } from "react";
import Image from 'next/image';
import UploadPhoto from "./JournalFeatures/UploadPhoto";
import EditPhoto from "./JournalFeatures/EditPhoto";
import ViewPhotos from "./JournalFeatures/ViewPhotos";

interface User {
  id: number;
  username: string;
  name: string;
}

interface Photo {
  id: string;
  caption: string;
  imageUrl: string
  day: string;
  createdAt: string;
  updatedAt: string;
}

interface JournalProps {
  tripId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  tripPeopleInvited: string[];
  tripName: string;
}

interface DayInfo {
  label: string;
  date: Date;
}

export default function Journal({ tripId, startDate, endDate, tripName }: JournalProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [days, setDays] = useState<DayInfo[]>([]);
  const [coverPhotos, setCoverPhotos] = useState<Record<string, Photo | null>>({});
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editingPhotos, setEditingPhotos] = useState<{ day: string; label: string } | null>(null);
  const [viewPhotos, setViewPhotos] = useState<{ day: string; label: string } | null>(null);
  const [photosByDay, setPhotosByDay] = useState<Record<string, Photo[]>>({});

  {/* Fetch days in order from start to end */}
  useEffect(() => {
    const generateDays = () => {
      if (!startDate || !endDate) {
        setDays([]);
        return;
      }
      const result: { label: string; date: Date }[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      let counter = 1;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        result.push({
          label: `Day ${counter}: ${d.toLocaleDateString("en-GB")}`,
          date: new Date(d),
        });
        counter++;
      }
      setDays(result);
    };
    generateDays();
  }, [startDate, endDate]);

  {/* Fetch photos from trip, and set cover photos */}
  useEffect(() => {
    const fetchPhotos = async () => {
      const res = await fetch(`/api/photos?tripId=${tripId}`)
      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to fetch photos. Status:", res.status, "Body:", text);
        return;
      }
      try {
        const data: Photo[] = await res.json()
        const photoMap: Record<string, Photo | null> = {}
        data.forEach((photo) => {
          const dayKey = photo.day.split('T')[0]
          if (!photoMap[dayKey]) photoMap[dayKey] = photo
        })
        setCoverPhotos(photoMap);
      } catch (err) {
        console.error("Error parsing JSON:", err);
      }
    };
    fetchPhotos()
  }, [tripId]);

  {/* Fetch current user */}
    useEffect(() => {
      const fetchUser = async () => {
        try {
          const res = await fetch("/api/me");
          const data = await res.json();
          if (res.ok) {
            setCurrentUser(data);
          } else {
            console.error("Failed to fetch user:", data.error);
          }
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      };
      fetchUser();
    }, []);
    if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="px-6 py-4">
      <h1 className="text-4xl text-center font-bold mt-4">
        Your memories from <span className="italic">{tripName}</span>
      </h1>
      {/* Days display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mt-8">
        {days.map((day, idx) => {
          const iso = day.date.toISOString().split('T')[0]
          const label = `Day ${idx + 1}: ${iso}`;
          const photo = coverPhotos[iso]
          return (
            <div key={idx} className="border rounded-xl shadow overflow-hidden">
              <div className="px-4 py-2 border-b bg-gray-50">
                <div className="text-xl text-[#784527] mt-3 text-center mb-2">
                  {day.label}
                </div>
              </div>
              
              {/* Cover photo with day album view onclick */}
                {photo ? (
                  <div className="relative w-full h-48">
                    <Image
                      src={photo.imageUrl}
                      alt={photo.caption}
                      fill
                      className="object-cover object-center rounded cursor-pointer transition duration-200 hover:opacity-80"
                      onClick={() => {
                        setSelectedDay(iso);
                        setViewPhotos({ day: iso, label });
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400">
                    No photos yet!
                  </div>
                )}
                {viewPhotos && (
                  <ViewPhotos
                    tripId={tripId}
                    day={viewPhotos.day}
                    label={viewPhotos.label}
                    onClose={() => setViewPhotos(null)}
                  />
                )}
          
              {/* Upload and Edit options */}
              <div className="flex justify-between px-4 py-3 border-t bg-white">
                <button
                  className="bg-[#e6ccb2] hover:bg-[#d9bfa5] text-[#432818] px-3 py-1 rounded cursor-pointer"
                  onClick={() => {
                    setSelectedDay(iso);
                    setShowUpload(true);
                  }}
                >
                  Upload
                </button>
                {showUpload && selectedDay && (
                  <UploadPhoto
                    day={selectedDay}
                    tripId={tripId ?? ""}
                    onClose={() => {
                      setSelectedDay(null);
                      setShowUpload(false);
                    }}
                    onUpload={(newPhoto) => {
                      setPhotosByDay(prev => ({
                        ...prev,
                        [selectedDay]: [newPhoto, ...(prev[selectedDay] || [])],
                      }));
                    }}
                  />
                )}
                <button
                  className="bg-[#d3d3bfd0] hover:bg-[#aeae9cd0] text-[#432818] px-3 py-1 rounded cursor-pointer"
                  onClick={() => {
                    setSelectedDay(iso);
                    setEditingPhotos({ day: iso, label });
                  }}
                >
                  Edit
                </button>
                {editingPhotos && selectedDay && (
                  <EditPhoto
                    day={editingPhotos.day}
                    label={editingPhotos.label}
                    tripId={tripId}
                    onClose={() => {
                      setEditingPhotos(null);
                      setSelectedDay(null);
                    }}
                    onDelete={(deletedId) => {
                      setPhotosByDay(prev => ({
                        ...prev,
                        [selectedDay]: (prev[selectedDay] || []).filter(p => p.id !== deletedId),
                      }));
                    }}
                    onEdit={(updatedPhoto) => {
                      setPhotosByDay(prev => ({
                        ...prev,
                        [selectedDay]: (prev[selectedDay] || []).map(p =>
                          p.id === updatedPhoto.id ? updatedPhoto : p
                        ),
                      }));
                    }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
