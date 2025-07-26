import React from "react";

type DeleteTripProps = {
  setShowConfirm: (showConfirm: boolean) => void;
  setDeleteTrip: (deleteTrip: string) => void;
  handleDelete: (deleteTrip: string) => void;
  deleteTrip: string;
  showConfirm: boolean;
};

const DeleteTripPopup: React.FC<DeleteTripProps> = ({
  setShowConfirm,
  setDeleteTrip,
  deleteTrip,
  handleDelete,
  showConfirm,
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center rounded-4xl justify-center bg-black/50 transition-all duration-600 ease-in-out 
      ${showConfirm ? "opacity-100" : "opacity-0 pointer-events-none"}
    `}
    >
      <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-sm text-center">
        <h2 className={` text-lg font-semibold text-gray-800 mb-4`}>
          Are you sure you want to delete this trip?
        </h2>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setShowConfirm(false);
              setDeleteTrip("");
            }}
            className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDelete(deleteTrip)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTripPopup;
