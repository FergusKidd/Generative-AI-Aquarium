// pages/api/upload.js
import { containerClient } from "@/library/storageClient";
import { BlobServiceClient } from "@azure/storage-blob";
import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

/**
 * Handler function for the API endpoint.
 * It takes a request and a response object, uploads an image to Azure Blob Storage,
 * and sends the URL of the uploaded blob in the response.
 *
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      // Parse the request body to get the image URL and file name
      const { url, filename } = req.body;

      // Check if url and filename are provided
      if (!url || !filename) {
        return res.status(400).json({ error: "URL and filename are required" });
      }

      // Fetch the image from the URL
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Failed to fetch the image: ${response.statusText}`);
      const data = await response.arrayBuffer();

      // Get a block blob client
      const blockBlobClient = containerClient.getBlockBlobClient(filename);

      // Upload data to the blob
      const uploadBlobResponse = await blockBlobClient.upload(
        data,
        data.byteLength
      );

      // Respond with the URL to the uploaded blob
      res.status(200).json({
        message: "File uploaded successfully",
        url: blockBlobClient.url,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res
        .status(500)
        .json({ error: "Error uploading file to Azure Blob Storage" });
    }
  } else {
    // Handle any other HTTP methods
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}