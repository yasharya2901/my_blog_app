import React, { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { FaEye, FaPencil, FaImage } from "react-icons/fa6";
import toast from "react-hot-toast";

interface MarkdownEditorProps {
  initialContent: string;
  onContentChange: (content: string, images: Record<string, string>) => void;
  readOnly?: boolean;
}

export default function MarkdownEditor({ initialContent, onContentChange, readOnly = false }: MarkdownEditorProps) {
  // Content state - store markdown with placeholders
  const [content, setContent] = useState<string>(initialContent);

  // Image storage - maps placeholder IDs to base64 strings
  const [images, setImages] = useState<Record<string, string>>({});
  const [imageCounter, setImageCounter] = useState(0);

  const [saving, setSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Extract base64 images from content and replace with placeholders
  const extractBase64Images = (contentStr: string) => {
    const base64Regex = /!\[([^\]]*)\]\((data:image\/[^;]+;base64,[^\)]+)\)/g;
    const extractedImages: Record<string, string> = {};
    let counter = imageCounter;
    
    const contentWithPlaceholders = contentStr.replace(base64Regex, (match, altText, base64) => {
      const imageId = `img_${counter}`;
      extractedImages[imageId] = base64;
      counter++;
      return `![${altText}]({{${imageId}}})`;
    }); 
    
    setImageCounter(counter);
    setImages(prev => ({ ...prev, ...extractedImages }));
    return contentWithPlaceholders;
  };

  // Replace placeholders with actual base64 for preview/saving
  const getFullMarkdown = () => {
    let fullContent = content || "";
    Object.entries(images).forEach(([id, base64]) => {
      fullContent = fullContent.replace(new RegExp(`{{${id}}}`, 'g'), base64);
    });
    return fullContent;
  };

  // Get markdown for editing (with placeholders)
  const getEditorContent = () => {
    return content || "";
  };

  const handleMarkdownChange = (value?: string) => {
    const newContent = value || "";
    setContent(newContent);
    onContentChange(newContent, images);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    toast.loading("Processing image...");

    // Compress and convert to base64
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      // Create canvas for compression
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Max dimensions (adjust as needed)
      const maxWidth = 1200;
      const maxHeight = 1200;
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to base64 with compression
      const base64String = canvas.toDataURL('image/jpeg', 0.8); // 80% quality
      
      // Create placeholder
      const imageId = `img_${imageCounter}`;
      setImageCounter(prev => prev + 1);
      setImages(prev => ({ ...prev, [imageId]: base64String }));
      
      // Insert placeholder in markdown
      const imageMarkdown = `![${file.name}]({{${imageId}}})`;
      const newContent = content ? `${content}\n\n${imageMarkdown}` : imageMarkdown;
      setContent(newContent);
      
      // Update images state and notify parent
      const updatedImages = { ...images, [imageId]: base64String };
      setImages(updatedImages);
      onContentChange(newContent, updatedImages);
      
      toast.dismiss();
      toast.success("Image added!");
      setUploading(false);
      
      // Reset input
      event.target.value = '';
    };

    reader.readAsDataURL(file);
  };

  // Sync initial content and extract base64 images
  useEffect(() => {
    if (initialContent) {
      const contentWithPlaceholders = extractBase64Images(initialContent);
      setContent(contentWithPlaceholders);
      // Notify parent of initial extracted images
      onContentChange(contentWithPlaceholders, images);
    }
  }, [initialContent]);

  return (
    <div className="w-full" data-color-mode="dark">

      {/* Editor Area */}
      <div className="bg-black border border-gray-800 rounded-lg overflow-hidden shadow-2xl shadow-black/50">
        
        {/* Toolbar */}
        <div className="border-b border-gray-800 p-3 flex justify-between items-center">
          <div>
            <label htmlFor="image-upload" className={`px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded flex items-center gap-2 text-sm transition-colors cursor-pointer ${uploading || readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <FaImage /> {uploading ? 'Processing...' : 'Upload Image (Base64)'}
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading || readOnly}
            />
          </div>
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded flex items-center gap-2 text-sm transition-colors"
          >
            {isPreviewMode ? (
              <>
                <FaPencil /> Edit Mode
              </>
            ) : (
              <>
                <FaEye /> Preview Mode
              </>
            )}
          </button>
        </div>

        {/* Editor */}
        <div className="p-6">
          <MDEditor
            value={isPreviewMode ? getFullMarkdown() : getEditorContent()}
            onChange={readOnly ? undefined : handleMarkdownChange}
            preview={isPreviewMode ? "preview" : "edit"}
            height={500}
            hideToolbar={false}
            visibleDragbar={false}
          />
        </div>

      </div>
    </div>
  );
}