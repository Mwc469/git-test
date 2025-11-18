'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from '../../lib/toast';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
}

export default function FileUpload({
  onUpload,
  accept = {
    'video/*': ['.mp4', '.mov', '.avi'],
    'image/*': ['.png', '.jpg', '.jpeg', '.gif']
  },
  maxSize = 500 * 1024 * 1024, // 500MB
  multiple = true
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            toast.error(`File too large`, `${file.name} exceeds the maximum size`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`Invalid file type`, `${file.name} is not a supported file type`);
          } else {
            toast.error(`Upload error`, error.message);
          }
        });
      });
    }

    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles);
      toast.success(`${acceptedFiles.length} file(s) ready for upload`);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
        ${isDragActive
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <div className="text-6xl">
          {isDragActive ? '📥' : '📤'}
        </div>
        {isDragActive ? (
          <p className="text-lg font-medium text-blue-700 dark:text-blue-300">
            Drop files here...
          </p>
        ) : (
          <>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Drag & drop files here
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              or click to browse
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Supports videos and images up to 500MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}
