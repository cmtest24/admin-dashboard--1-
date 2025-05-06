"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
// Chuẩn hóa đường dẫn ảnh
function getFullImageUrl(url: string | undefined): string {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/public/")) return `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`;
  return url;
}
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"

// Use conditional types for more precise typing based on the 'multiple' prop
interface ImageUploadPropsBase {
  label?: string
  disabled?: boolean
  multiple?: boolean
}

interface SingleImageUploadProps extends ImageUploadPropsBase {
  multiple?: false;
  value: string;
  onChange: (url: string) => void;
}

interface MultipleImageUploadProps extends ImageUploadPropsBase {
  multiple: true;
  value: string[];
  onChange: (urls: string[]) => void;
}

type ImageUploadProps = SingleImageUploadProps | MultipleImageUploadProps;


export function ImageUpload({ value, onChange, label = "Hình ảnh", disabled = false, multiple = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Basic validation for each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Kiểm tra kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`Kích thước file "${file.name}" quá lớn (tối đa 5MB)`);
        return;
      }
      // Kiểm tra loại file
      if (!file.type.startsWith("image/")) {
        setError(`File "${file.name}" không phải là hình ảnh`);
        return;
      }
    }


    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      // API expects the key 'images' for file uploads, supporting multiple files
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      const token = localStorage.getItem("adminToken")

      // Sử dụng fetch trực tiếp vì FormData không thể sử dụng với JSON
      const response = await fetch(`${API_BASE_URL}/api/upload-images`, {
        method: "POST",
        body: formData,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // Do NOT set Content-Type header for FormData, browser handles it
        },
      })

      if (!response.ok) {
        console.error("Tải lên thất bại:", response); // Log the response object
        throw new Error("Tải lên thất bại");
      }

      const data = await response.json() as { imageUrls: string[] }; // Assuming API returns imageUrls array

      if (multiple) {
        // For multiple uploads, append new URLs to existing ones
        // Ensure value is treated as string[] when multiple is true
        const currentUrls = (value as string[] | undefined) || [];
        (onChange as (urls: string[]) => void)([...currentUrls, ...data.imageUrls]);
      } else {
        // For single upload, replace the current URL
        // Ensure value is treated as string when multiple is false
        (onChange as (url: string) => void)(data.imageUrls[0] || ''); // Assuming API returns at least one URL for single upload
      }

    } catch (err) {
      setError("Tải lên thất bại. Vui lòng thử lại.")
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    // Ensure value is treated as string[] when multiple is true
    if (multiple && Array.isArray(value)) {
      const newUrls = value.filter((_, index) => index !== indexToRemove);
      (onChange as (urls: string[]) => void)(newUrls);
    } else if (!multiple && typeof value === 'string') {
      // Should not happen in single mode with remove button, but for safety
      (onChange as (url: string) => void)('');
    }
  };


  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-col gap-4">
        {/* Preview Section */}
        {multiple ? (
          // Preview for multiple images
          <div className="grid grid-cols-3 gap-4"> {/* Adjust grid columns as needed */}
            {/* Ensure value is treated as string[] when multiple is true */}
            {Array.isArray(value) && value.map((url, index) => url && (
              <div key={index} className="relative h-24 w-full overflow-hidden rounded-md border"> {/* Smaller preview */}
                <Image src={getFullImageUrl(url)} alt={`Uploaded image ${index + 1}`} fill className="object-cover" />
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-1 top-1 h-5 w-5" // Smaller button
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" /> {/* Smaller icon */}
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Preview for single image
          // Ensure value is treated as string when multiple is false
          typeof value === 'string' && value && (
            <div className="relative h-40 w-40 overflow-hidden rounded-md border">
              <Image src={getFullImageUrl(value)} alt="Uploaded image" fill className="object-cover" />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-1 top-1 h-6 w-6"
                  onClick={() => (onChange as (url: string) => void)("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )
        )}

        {/* Upload Input */}
        {!disabled && (
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={isUploading}
              className="hidden"
              id={`image-upload-${multiple ? 'multiple' : 'single'}`} // Unique ID
              multiple={multiple} // Enable multiple selection
            />
            <Label
              htmlFor={`image-upload-${multiple ? 'multiple' : 'single'}`} // Match ID
              className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed p-4 hover:bg-muted"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Đang tải lên..." : multiple ? "Tải lên hình ảnh bổ sung" : "Tải lên hình ảnh"}
            </Label>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
