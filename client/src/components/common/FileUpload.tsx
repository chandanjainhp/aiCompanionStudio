import { useState, useRef } from 'react';
import { Upload, X, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  projectId: string;
  onUploadSuccess?: (file: any) => void;
  onUploadError?: (error: Error) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export function FileUpload({
  projectId,
  onUploadSuccess,
  onUploadError,
  accept = '.pdf,.txt,.docx,.csv,.json,.jpg,.png,.webp,.gif',
  maxSize = 10,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    // Check size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSize) {
      toast({
        title: 'File too large',
        description: `File size must be less than ${maxSize}MB`,
        variant: 'destructive',
      });
      return false;
    }

    // Check type
    const allowedTypes = accept
      .split(',')
      .map((ext) => (ext.startsWith('.') ? ext.substring(1) : ext))
      .map((ext) => ext.toLowerCase());

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      toast({
        title: 'File type not allowed',
        description: `Allowed types: ${accept}`,
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = async (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const response = await apiClient.uploadFile(projectId, selectedFile);

      if (response.success && response.data) {
        toast({
          title: 'Success',
          description: 'File uploaded successfully',
        });
        onUploadSuccess?.(response.data);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Upload failed';
      toast({
        title: 'Upload failed',
        description: message,
        variant: 'destructive',
      });
      onUploadError?.(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/30 hover:border-primary/50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3 text-center">
          {selectedFile ? (
            <>
              <File className="w-8 h-8 text-primary" />
              <div>
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Drag and drop your file here</p>
                <p className="text-xs text-muted-foreground">
                  or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:underline"
                  >
                    click to browse
                  </button>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Max {maxSize}MB • {accept}
              </p>
            </>
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="flex-1"
          >
            {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isUploading ? 'Uploading...' : 'Upload File'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            disabled={isUploading}
            size="icon"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
