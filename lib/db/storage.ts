// lib/storage.ts
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { PassThrough } from "stream";

// Initialize the S3 client using environment variables
const s3 = new S3Client({
  region: process.env.AWS_REGION || "auto", // "auto" is standard for Cloudflare R2
  endpoint: process.env.AWS_ENDPOINT_URL,    // Your bucket provider's endpoint URL
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "";

/**
 * Uploads a Node.js PassThrough stream of unknown size directly to S3/R2.
 * It chunks the stream into 5MB parts on the fly so your server memory stays low.
 */
export async function uploadStreamToStorage(stream: PassThrough, filename: string): Promise<string> {
  if (!process.env.AWS_ACCESS_KEY_ID || !BUCKET_NAME) {
    console.warn("Storage credentials missing. Direct CDN links will not generate properly.");
  }

  try {
    const parallelUpload = new Upload({
      client: s3,
      params: {
        Bucket: BUCKET_NAME,
        Key: `audio/${filename}`,
        Body: stream,
        ContentType: "audio/mpeg",
      },
      queueSize: 4,               // Number of concurrent part uploads
      partSize: 1024 * 1024 * 5,  // 5MB chunk sizes minimum for AWS S3 multipart compatibility
    });

    // Execute the background stream upload
    const result = await parallelUpload.done();
    
    // Construct and return the public URL of the uploaded file
    if (process.env.NEXT_PUBLIC_CDN_URL) {
      return `${process.env.NEXT_PUBLIC_CDN_URL}/audio/${filename}`;
    }
    
    return result.Location || "";
  } catch (error) {
    console.error("Cloud storage multi-part upload failed:", error);
    throw error;
  }
}