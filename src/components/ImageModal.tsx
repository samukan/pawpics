'use client';

import {Dialog, DialogContent} from '@/components/ui/dialog';
import Image from 'next/image';
import {useState} from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

export function ImageModal({isOpen, onClose, imageUrl, alt}: ImageModalProps) {
  // Track loaded state to show spinner until image loads
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] p-0 bg-transparent border-none">
        <div className="relative w-full bg-transparent">
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <div
            className={`${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } transition-opacity duration-300`}
          >
            <Image
              src={imageUrl}
              alt={alt}
              width={1200}
              height={800}
              className="w-full h-auto object-contain rounded-lg"
              onLoad={() => setIsLoaded(true)}
              priority
              unoptimized={imageUrl.includes('utfs.io')}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
