'use client';

import {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {UploadButton} from '@/lib/uploadthing';
import {X, FileImage, Loader2} from 'lucide-react';
import {toast} from 'react-hot-toast';
import Image from 'next/image';
import {useAuth} from '@/components/AuthProvider';

interface MediaUploaderProps {
  onMediaUploaded: (url: string, type: string) => void;
  mediaUrl: string | null;
  onClear: () => void;
}

export default function MediaUploader({
  onMediaUploaded,
  mediaUrl,
  onClear,
}: MediaUploaderProps) {
  const {token} = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [key, setKey] = useState(Date.now());

  // Determine if the media is a video based on its extension or URL structure
  const isVideo = mediaUrl
    ? mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) || mediaUrl.includes('video')
    : false;

  // Get auth header on each render to ensure it's fresh
  const getAuthHeader = () => {
    return {Authorization: `Bearer ${token}`};
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
                unoptimized={true} // Always use unoptimized for uploaded media
              />
            </div>
          )}
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
            onClick={onClear}
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
              <UploadButton
                key={key}
                endpoint="mediaUploader"
                onClientUploadComplete={(res) => {
                  setIsUploading(false);
                  if (res && res.length > 0) {
                    const file = res[0];
                    onMediaUploaded(file.ufsUrl, file.type);
                    toast.success('Upload complete');
                    setKey(Date.now());
                  }
                }}
                onUploadError={(error) => {
                  setIsUploading(false);
                  toast.error(`Error: ${error.message}`);
                  setKey(Date.now());
                }}
                onUploadBegin={() => {
                  setIsUploading(true);
                }}
                className="ut-button:bg-primary ut-button:ut-readying:bg-primary/80 ut-button:ut-uploading:bg-primary/80 ut-button:w-full ut-allowed-content:hidden"
                headers={getAuthHeader}
                content={{
                  button({ready}) {
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
    </div>
  );
}
