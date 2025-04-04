import React, { useRef } from "react";
import Button from "../../ui/Button";
import { Add, CloseCircle } from "iconsax-react";

interface AddProjectModalContentProjectAttachmentsProps {
  selectedImages: File[];
  handleRemoveAttachment: (index: number) => void;
  handleAddAttachment: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

function AddProjectModalContentProjectAttachments({
  selectedImages,
  handleRemoveAttachment,
  handleAddAttachment,
  disabled,
}: AddProjectModalContentProjectAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClickInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="cursor-default text-sm font-medium tracking-0.1 text-gray-800">
        Attachments
      </span>

      <div className="flex flex-wrap gap-3">
        {selectedImages.map((image, index) => (
          <div key={index} className="group relative">
            <img
              src={URL.createObjectURL(image)}
              alt={`Selected ${index}`}
              className="h-36 rounded-lg"
            />
            {!disabled && (
              <Button
                onClick={() => handleRemoveAttachment(index)}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-100 p-1.5 text-gray-700 shadow-md transition-all duration-100 hover:text-error-700 focus:outline-none"
              >
                <CloseCircle size="20" variant="Linear" />
              </Button>
            )}
          </div>
        ))}

        <>
          <input
            aria-label="attachment"
            type="file"
            multiple
            accept=".jpeg, .jpg, .png, .webp"
            disabled={disabled}
            onChange={handleAddAttachment}
            className="hidden"
            ref={fileInputRef}
          />
          <Button
            onClick={handleClickInput}
            disabled={disabled}
            className="group flex h-36 w-48 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-100 transition-all duration-100 hover:border-gray-400 disabled:cursor-not-allowed disabled:bg-gray-200"
          >
            <span className="text-gray-600 transition-all duration-100 group-hover:text-gray-700">
              <Add size="28" variant="Linear" />
            </span>
          </Button>
        </>
      </div>
    </div>
  );
}

export default AddProjectModalContentProjectAttachments;
