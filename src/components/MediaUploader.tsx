'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {UploadButton} from '@/lib/uploadthing';
import {X, FileImage, Loader2} from 'lucide-react';
import {toast} from 'react-hot-toast';
import Image from 'next/image';
import {useAuth} from '@/components/AuthProvider';
import {
  FileUploadResponse,
  FileUploadError,
  UploadReadyState,
} from '../types/ApiResponse';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MediaUploaderProps {
  onMediaUploaded: (url: string) => void;
  mediaUrl?: string;
  onClear?: () => void;
}

export default function MediaUploader({
  onMediaUploaded,
  mediaUrl,
  onClear,
}: MediaUploaderProps) {
  const {token} = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [key, setKey] = useState(Date.now());
  const [dialogOpen, setDialogOpen] = useState(false);

  // Determine if the media is a video based on its extension or URL structure
  const isVideo = mediaUrl
    ? mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) || mediaUrl.includes('video')
    : false;

  // Get auth header on each render to ensure it's fresh
  const getAuthHeader = () => {
    return {Authorization: `Bearer ${token}`};
  };

  const handleClearRequest = () => {
    setDialogOpen(true);
  };

  const handleConfirmClear = () => {
    setDialogOpen(false);
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="w-full space-y-4">
      {mediaUrl ? (
        <div className="relative rounded-md overflow-hidden bg-muted">
          {isVideo ? (
            <video
              src={mediaUrl}
              controls
              className="w-full max-h-[300px] object-contain"
            />
          ) : (
            <div className="relative h-[300px] w-full">
              <Image
                src={mediaUrl}
                alt="Uploaded media"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-contain"
                unoptimized={true}
              />
            </div>
          )}
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
            onClick={handleClearRequest}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="w-full">
              <UploadButton<FileUploadResponse>
                key={key}
                endpoint="mediaUploader"
                onClientUploadComplete={(res: FileUploadResponse[]) => {
                  setIsUploading(false);
                  if (res && res.length > 0) {
                    const file = res[0];
                    onMediaUploaded(file.url, file.type || '');
                    toast.success('Upload complete');
                    setKey(Date.now());
                  }
                }}
                onUploadError={(error: FileUploadError) => {
                  setIsUploading(false);
                  toast.error(`Error: ${error.message}`);
                  setKey(Date.now());
                }}
                onUploadBegin={() => {
                  setIsUploading(true);
                }}
                className="ut-button:bg-blue-500 ut-button:hover:bg-blue-600"
                headers={getAuthHeader}
                content={{
                  button({ready}: UploadReadyState) {
                    if (ready) {
                      return (
                        <div className="flex items-center justify-center space-x-2">
                          <FileImage className="h-4 w-4" />
                          <span>Select Image or Video</span>
                        </div>
                      );
                    }
                    return 'Loading...';
                  },
                }}
              />

              {/* Put the allowed content text here only once, with updated size limits */}
              <p className="text-xs text-center text-muted-foreground mt-2">
                Images (JPG, PNG) up to 16MB or Videos (MP4) up to 32MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog with proper accessibility */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Media</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this media? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmClear}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
