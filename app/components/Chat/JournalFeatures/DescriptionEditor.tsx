import React from "react";
import { useState } from "react";

interface DescriptionEditorProps {
  defaultDescription?: string;
  onSave: (desc: string) => void;
  autoEdit?: boolean;
}

export default function DescriptionEditor({ defaultDescription = "", onSave, autoEdit = false }: DescriptionEditorProps) {
    const [isEditing, setIsEditing] = useState<boolean>(autoEdit);
    const [desc, setDesc] = useState<string>(defaultDescription);
    const handleSubmit = () => {
        onSave(desc.trim());
        setIsEditing(false);
    };

    return (
    <div className="mt-1">
      {isEditing ? (
        <textarea
          autoFocus
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="w-full p-2 text-sm text-[#432818] bg-[#fff5ec] border border-[#e0c7b1] rounded"
          placeholder="Add description here..."
          rows={2}
        />
      ) : (
        <button
          className="mt-1 text-md text-[#784527] hover:underline hover:font-bold transition cursor-pointer"
          onClick={() => setIsEditing(true)}
        >
          {desc.trim() ? desc : "Add Description"}
        </button>
      )}
    </div>
  );
};
