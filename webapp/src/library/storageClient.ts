import { BlobServiceClient } from "@azure/storage-blob";

/**
 * This module exports a container client for Azure Blob Storage.
 * It reads the storage connection string and container name from environment variables,
 * creates a BlobServiceClient from the connection string, and then gets a container client for the specified container.
 * If the environment variables are not set, it throws an error.
 */

const storageContainerString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const storageContainerName = process.env.AZURE_CONTAINER_NAME;

// Check if the storage connection string is provided
if (!storageContainerString) {
  throw new Error("Azure storage credentials are not properly configured. Please set the AZURE_STORAGE_CONNECTION_STRING environment variable.");
}

// Check if the storage container name is provided
if (!storageContainerName) {
  throw new Error("Azure storage container name is not properly configured. Please set the AZURE_CONTAINER_NAME environment variable.");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(storageContainerString);

// Get a reference to a container
export const containerClient = blobServiceClient.getContainerClient(storageContainerName);