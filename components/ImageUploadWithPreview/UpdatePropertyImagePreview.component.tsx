import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from "lucide-react";

interface ExistingImage {
  id: number;
  property: number;
  image: string;
  is_primary: boolean;
  order: number;
}

interface ImageUploadProps {
  existingImages?: ExistingImage[];
  maxFiles?: number;
  acceptedFormats?: string[];
  minWidth?: number;
  minHeight?: number;
  propertyId?: any;
  onImageCreate?: (
    propertyId: number,
    image: File,
    order: number
  ) => Promise<any>;
  onImageDelete?: (imageId: number) => Promise<any>;
  onImageReorder?: (images: ExistingImage[]) => Promise<any>;
}

interface ImageItem {
  id: string;
  file?: File;
  preview: string;
  isExisting: boolean;
  dbId?: number;
  order?: number;
}

const UpdatePropertyImagePreview: React.FC<ImageUploadProps> = ({
  existingImages = [],
  maxFiles = 10,
  acceptedFormats = ["image/jpeg", "image/png"],
  minWidth = 2048,
  minHeight = 768,
  propertyId,
  onImageCreate,
  onImageDelete,
  onImageReorder,
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    const existingImageItems: ImageItem[] = existingImages.map((img) => ({
      id: `existing-${img.id}`,
      preview: img.image,
      isExisting: true,
      dbId: img.id,
      order: img.order,
    }));

    setImages(existingImageItems);
  }, [existingImages]);

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
    const newImages: ImageItem[] = [];
    setError("");

    const currentImageCount = images.length;
    const availableSlots = maxFiles - currentImageCount;

    if (availableSlots <= 0) {
      setError(
        `Maximum ${maxFiles} images allowed. Remove some images to add new ones.`
      );
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];

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
      newImages.push({
        id: `new-${Date.now()}-${i}`,
        file,
        preview,
        isExisting: false,
      });
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages].slice(0, maxFiles);
      setImages(updatedImages);

      await uploadNewImagesToAPI(newImages);
    }
  };

  const uploadNewImagesToAPI = async (newImages: ImageItem[]) => {
    if (!onImageCreate || !propertyId) {
      console.error("Missing onImageCreate function or propertyId");
      return;
    }

    setIsLoading(true);
    try {
      const maxExistingOrder =
        existingImages.length > 0
          ? Math.max(...existingImages.map((img) => img.order))
          : -1;

      let currentOrder = maxExistingOrder;

      for (const imageItem of newImages) {
        if (imageItem.file) {
          currentOrder++;
          await onImageCreate(propertyId, imageItem.file, currentOrder);
        }
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      setError("Failed to upload some images. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
  };

  const handleDragEnter = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    dragOverItem.current = index;
    e.preventDefault();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);

      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        await processFiles(event.dataTransfer.files);
      } else {
        handleReorderDrop();
      }
    },
    [images]
  );

  const handleReorderDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;

    const draggedIndex = dragItem.current;
    const dropIndex = dragOverItem.current;

    if (draggedIndex === dropIndex) return;

    setIsReordering(true);

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);

    const reorderedImages = newImages.map((img, index) => ({
      ...img,
      order: index,
    }));

    setImages(reorderedImages);

    updateImageOrders(reorderedImages);

    dragItem.current = null;
    dragOverItem.current = null;
  };

  const updateImageOrders = async (reorderedImages: ImageItem[]) => {
    if (!onImageReorder) return;

    try {
      const existingImagesToUpdate: ExistingImage[] = reorderedImages
        .filter((img) => img.isExisting && img.dbId)
        .map((img, index) => ({
          id: img.dbId!,
          property: propertyId,
          image: img.preview,
          is_primary: false,
          order: index,
        }));

      await onImageReorder(existingImagesToUpdate);
    } catch (error) {
      console.error("Error updating image orders:", error);
      const originalImages = existingImages.map((img) => ({
        id: `existing-${img.id}`,
        preview: img.image,
        isExisting: true,
        dbId: img.id,
        order: img.order,
      }));
      setImages(originalImages);
    } finally {
      setIsReordering(false);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(event.target.files);
      event.target.value = "";
    }
  };

  const handleDropForUpload = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);

      if (event.dataTransfer.files) {
        await processFiles(event.dataTransfer.files);
      }
    },
    [images]
  );

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];

    setIsLoading(true);
    try {
      if (imageToRemove.isExisting && imageToRemove.dbId && onImageDelete) {
        await onImageDelete(imageToRemove.dbId);
      }

      if (!imageToRemove.isExisting) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);
      setError("");
    } catch (error) {
      console.error("Error deleting image:", error);
      setError("Failed to delete image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 120;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const availableSlots = maxFiles - images.length;

  return (
    <div className="w-full">
      {(isLoading || isReordering) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-4">
            <p className="text-gray-700">
              {isReordering ? "Updating order..." : "Processing images..."}
            </p>
          </div>
        </div>
      )}

      <div
        className={`
          cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
          ${error ? "border-red-300" : ""}
          ${availableSlots <= 0 ? "cursor-not-allowed opacity-50" : ""}
          ${isLoading ? "cursor-not-allowed opacity-50" : ""}
        `}
        onDrop={
          availableSlots > 0 && !isLoading ? handleDropForUpload : undefined
        }
        onDragOver={(e) => {
          if (availableSlots > 0 && !isLoading) {
            e.preventDefault();
            setIsDragging(true);
          }
        }}
        onDragLeave={(e) => {
          if (availableSlots > 0 && !isLoading) {
            e.preventDefault();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsDragging(false);
            }
          }
        }}
        onClick={availableSlots > 0 && !isLoading ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(",")}
          onChange={handleFileInput}
          className="hidden"
          disabled={availableSlots <= 0 || isLoading}
        />

        <Upload
          className={`mx-auto mb-4 h-12 w-12 ${
            availableSlots <= 0 || isLoading ? "text-gray-300" : "text-gray-400"
          }`}
        />

        <div className="space-y-2">
          <p
            className={`text-lg font-semibold ${
              availableSlots <= 0 || isLoading
                ? "text-gray-400"
                : "text-gray-700"
            }`}
          >
            {availableSlots <= 0
              ? "Maximum images reached"
              : isLoading
              ? "Processing images..."
              : "Upload/Drag photos of your property"}
          </p>
          <p className="text-sm text-gray-500">
            Photos must be JPEG or PNG format and at least {minWidth}x
            {minHeight}
            <br />
            <strong>
              {availableSlots > 0 && !isLoading
                ? `${availableSlots} slot${
                    availableSlots !== 1 ? "s" : ""
                  } available`
                : isLoading
                ? "Processing..."
                : "No slots available"}
            </strong>
          </p>
          {availableSlots > 0 && !isLoading && (
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
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="relative mt-6">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:bg-gray-100"
            disabled={isLoading}
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>

          <div
            ref={scrollRef}
            className="scrollbar-hide flex gap-3 overflow-x-auto scroll-smooth px-8 py-5"
          >
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`group relative flex-shrink-0 ${
                  isReordering ? "cursor-grabbing" : "cursor-grab"
                }`}
                draggable={image.isExisting} // Only allow dragging for existing images
                onDragStart={(e) =>
                  image.isExisting && handleDragStart(e, index)
                }
                onDragEnter={(e) =>
                  image.isExisting && handleDragEnter(e, index)
                }
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="relative h-24 w-24 overflow-hidden rounded-lg border bg-gray-100">
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-image.jpg";
                    }}
                  />
                  {image.isExisting && (
                    <div className="absolute left-1 top-1 cursor-grab rounded bg-black bg-opacity-50 p-1">
                      <GripVertical className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black bg-opacity-70">
                    <span className="text-xs font-medium text-white">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                  title="Remove image"
                  disabled={isLoading || isReordering}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:bg-gray-100"
            disabled={isLoading}
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
};

export default UpdatePropertyImagePreview;
