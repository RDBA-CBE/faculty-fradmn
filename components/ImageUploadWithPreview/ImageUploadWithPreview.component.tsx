import React, { useCallback, useState, useRef } from "react";
import { Upload, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageUploadProps {
  onImagesChange: (images: File[]) => void;
  maxFiles?: number;
  acceptedFormats?: string[];
  minWidth?: number;
  minHeight?: number;
}

const ImageUploadWithPreview: React.FC<ImageUploadProps> = ({
  onImagesChange,
  maxFiles = 10,
  acceptedFormats = ["image/jpeg", "image/png"],
  minWidth = 2048,
  minHeight = 768,
}) => {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const isValid = img.width >= minWidth && img.height >= minHeight;
        URL.revokeObjectURL(img.src);
        resolve(isValid);
      };
      img.onerror = () => resolve(false);
    });
  };

  const processFiles = async (files: FileList) => {
    const newImages: { file: File; preview: string }[] = [];
    setError("");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!acceptedFormats.includes(file.type)) {
        setError(
          `Invalid file format: ${file.name}. Please upload JPEG or PNG files.`
        );
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(`File too large: ${file.name}. Maximum size is 10MB.`);
        continue;
      }

      const isValidDimensions = await validateImage(file);
      if (!isValidDimensions) {
        setError(
          `Invalid dimensions for ${file.name}. Minimum required: ${minWidth}x${minHeight} pixels.`
        );
        continue;
      }

      const preview = URL.createObjectURL(file);
      newImages.push({ file, preview });
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages].slice(0, maxFiles);
      setImages(updatedImages);
      onImagesChange(updatedImages.map((img) => img.file));
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(event.target.files);
      event.target.value = "";
    }
  };

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);

      if (event.dataTransfer.files) {
        await processFiles(event.dataTransfer.files);
      }
    },
    [images]
  );

  const removeImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(images[index].preview);

    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages.map((img) => img.file));
    setError("");
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 120; // how much to scroll per click
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full">
      {/* Drag and Drop Area */}
      <div
        className={`
          cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
          ${error ? "border-red-300" : ""}
        `}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
          }
        }}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(",")}
          onChange={handleFileInput}
          className="hidden"
        />

        <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />

        <div className="space-y-2">
          <p className="text-lg font-semibold text-gray-700">
            Upload/Drag photos of your property
          </p>
          <p className="text-sm text-gray-500">
            Photos must be JPEG or PNG format and at least {minWidth}x
            {minHeight}
          </p>
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={(e) => {
              e.stopPropagation();
              openFileDialog();
            }}
          >
            Browse Files
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Uploaded Images Preview */}
      <>
        {images.length > 0 && (
          <div className="relative mt-6 ">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>

            {/* Slider */}
            <div
              ref={scrollRef}
              className="scrollbar-hide flex gap-3 overflow-x-auto scroll-smooth px-8 py-5"
            >
              {images.map((image: any, index: number) => (
                <div key={index} className="group relative flex-shrink-0">
                  <div className="h-24 w-24 overflow-hidden rounded-lg border bg-gray-100">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                    title="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              type="button"
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        )}
      </>
    </div>
  );
};

export default ImageUploadWithPreview;
