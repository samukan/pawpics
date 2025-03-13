import {createUploadthing, type FileRouter} from 'uploadthing/next';
import {UploadThingError} from 'uploadthing/server';
import {getUserIdFromToken} from '@/lib/server/db-access';

const f = createUploadthing();

// Real auth function - replaces the fake one
const auth = async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const userId = await getUserIdFromToken(token);
  return {id: userId};
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Updated to support both images and videos with appropriate size limits
  mediaUploader: f({
    image: {maxFileSize: '16MB', maxFileCount: 1},
    video: {maxFileSize: '32MB', maxFileCount: 1},
  })
    .middleware(async ({req}) => {
      // Authenticate the request
      const user = await auth(req);

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError('Unauthorized');

      // Return the user ID to use in onUploadComplete
      return {userId: user.id};
    })
    .onUploadComplete(async ({metadata, file}) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('Upload complete for userId:', metadata.userId);
      console.log('file url:', file.ufsUrl);
      console.log('file type:', file.type);

      // Return the file information to the client
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
        type: file.type,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
