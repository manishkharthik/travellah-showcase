"use client";

import React, { useState, useEffect } from "react";

interface Label {
  name: string;
  color: string;
  id: string;
}

interface LabelManagerProps {
  tripId: string | null;
  labels: Label[];
  setLabels: React.Dispatch<React.SetStateAction<Label[]>>;
}

const LabelsArea: React.FC<LabelManagerProps> = ({
  tripId,
  labels,
  setLabels,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState("#f97316");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleOpenForm = () => {
    setIsOpen(true);
    setEditingIndex(null);
    setLabelName("");
    setLabelColor("#f97316");
  };

  const handleSaveLabel = async () => {
    const newLabel = { name: labelName, color: labelColor };

    // if i am currently editing the form
    if (editingIndex !== null) {
      const updatedLabel = labels[editingIndex];
      await fetch(`/api/labels/${updatedLabel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedLabel.id,
          name: newLabel.name,
          color: newLabel.color,
        }),
      });

      const updated = [...labels]; // create shallow copy of labels array
      updated[editingIndex] = { ...updatedLabel, ...newLabel };
      setLabels(updated);
    } else {
      // new label and i want to add it to the database
      const res = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newLabel, tripId }),
      });
      const savedLabel = await res.json();
      setLabels((prev) => [...prev, savedLabel]);
    }
    resetForm();
  };

  const handleEditLabel = async (index: number) => {
    const label = labels[index];
    setLabelName(label.name);
    setLabelColor(label.color);
    setEditingIndex(index);
    setIsOpen(true);
  };

  const handleDeleteLabel = async () => {
    if (editingIndex !== null) {
      const labelToDelete = labels[editingIndex];
      const updated = [...labels];
      updated.splice(editingIndex, 1);
      setLabels(updated);

      await fetch(`/api/labels`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: labelToDelete.id }),
      });
      resetForm();
    }
  };

  const resetForm = () => {
    setIsOpen(false);
    setLabelName("");
    setLabelColor("#f97316");
    setEditingIndex(null);
  };

  const getTextColor = (bgColor: string | undefined): string => {
    const safeColor = bgColor || "#f97316"; // fallback to default orange
    const hex = safeColor.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    return brightness > 155 ? "text-orange-950" : "text-white";
  };

  return (
    <div className="flex items-center justify-center basis-1/6 border-l-4 h-5/6 border-dotted border-amber-950 relative flex-col">
      {/* Show default button when no labels */}
      {!isOpen && labels.length === 0 && (
        <button
          onClick={handleOpenForm}
          className="text-orange-950 text-lg font-bold hover:underline"
        >
          Labels go here!
        </button>
      )}

      {/* if it's closed and there's one or more label */}
      {!isOpen && labels.length > 0 && (
        <div className="flex flex-wrap ml-0.5 flex-row justify-center gap-2 items-start">
          {labels.map((label, index) => (
            <button
              key={index}
              onClick={() => handleEditLabel(index)}
              className={`rounded-full border-orange-950 border px-3 py-1 text-md font-semibold ${getTextColor(
                label.color
              )}`}
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </button>
          ))}
          <button
            onClick={handleOpenForm}
            className="w-6 h-6 bg-orange-100 text-orange-950 rounded-full border border-orange-950 text-md font-bold hover:bg-orange-200"
            title="Add new label"
          >
            +
          </button>
        </div>
      )}

      {/* Form for adding/editing labels */}
      {isOpen && (
        <div className="absolute bottom-4 bg-white p-3 rounded-lg shadow-md w-11/12 border border-orange-950">
          <input
            type="text"
            placeholder="Label name"
            value={labelName}
            onChange={(e) => setLabelName(e.target.value)}
            className="w-full mb-2 p-1 border rounded text-sm"
          />
          <input
            type="color"
            value={labelColor}
            onChange={(e) => setLabelColor(e.target.value)}
            className="w-full mb-2 h-8"
          />
          <div className="flex justify-between">
            <button
              onClick={handleSaveLabel}
              className="px-2 py-1 bg-orange-950 text-white text-xs rounded"
            >
              {editingIndex !== null ? "Update Label" : "Add Label"}
            </button>
            {editingIndex !== null && (
              <button
                onClick={handleDeleteLabel}
                className="px-2 py-1 bg-red-500 text-white text-xs rounded"
              >
                Delete
              </button>
            )}
            <button
              onClick={resetForm}
              className="px-2 py-1 bg-amber-50 text-orange-950 border-orange-950 border text-xs rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabelsArea;
