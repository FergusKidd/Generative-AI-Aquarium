import { AzureKeyCredential, OpenAIClient } from '@azure/openai'

/**
 * This module exports an OpenAIClient for Azure's OpenAI service.
 * It reads the OpenAI key from an environment variable,
 * creates an OpenAIKeyCredential with the key, and then creates an OpenAIClient with the credential.
 * If the environment variable is not set, it throws an error.
 */

const azureKey = process.env.AZURE_OPENAI_KEY
const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT
const azureAPIVersion = process.env.AZURE_OPENAI_API_VERSION

// Check if the OpenAI key is provided
if (!azureKey) {
  throw new Error(
    'Azure OpenAI key is not properly configured. Please set the AZURE_OPENAI_KEY environment variable.',
  )
}

if (!azureEndpoint) {
  throw new Error(
    'Azure OpenAI endpoint is not properly configured. Please set the AZURE_OPENAI_ENDPOINT environment variable.',
  )
}

if (!azureAPIVersion) {
  throw new Error(
    'Azure OpenAI API version is not properly configured. Please set the AZURE_OPENAI_API_VERSION environment variable.',
  )
}

// Create an OpenAI client with the key
export const openaiClient = new OpenAIClient(
  azureEndpoint,
  new AzureKeyCredential(azureKey),
  {
    apiVersion: azureAPIVersion,
  },
)
