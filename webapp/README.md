# Gen AI Aquarium

Gen AI Aquarium Web App is a Next JS frontend that generates fish images based on a given prompt and saves them in Azure Blob Storage. The Python app then displays these images in an interactive aquarium.

## Environment Variables

This project uses the following environment variables:

- `AZURE_OPENAI_KEY`: Your Azure OpenAI Key.
- `AZURE_OPENAI_ENDPOINT`: Your Azure OpenAI Endpoint.
- `AZURE_STORAGE_CONNECTION_STRING`: Your Azure Storage Connection String.
- `AZURE_CONTAINER_NAME`: Your Azure Container Name.
- `AZURE_GPT_MODEL`: Your Azure GPT Model.
- `AZURE_DALLE_DEPLOYMENT_NAME`: Your Azure Dalle Deployment Name.
- `AZURE_OPENAI_API_VERSION`: Your Azure OpenAI API Version.

Create a `.env` file in the root of your project and add these variables:

```bash
AZURE_OPENAI_KEY=
AZURE_OPENAI_ENDPOINT=
AZURE_STORAGE_CONNECTION_STRING=
AZURE_CONTAINER_NAME=
AZURE_GPT_MODEL=
AZURE_DALLE_DEPLOYMENT_NAME=
AZURE_OPENAI_API_VERSION=
```

## Getting Started

1. Navigate to the `webapp` directory:

```bash
cd webapp
```

```bash
npm install
```

```bash
npm run dev
```
