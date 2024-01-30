import { openaiClient } from '@/library/openaiClient'
import { ChatRequestMessage } from '@azure/openai'
import { NextApiRequest, NextApiResponse } from 'next'

/**
 * Interface for the response from the Azure Open AI service ( Seems to be Incorrect in the Package)
 */
interface GenerateImageResponse {
  created: number
  data: Array<{
    url: string
  }>
}

/**
 * Handler function for the API endpoint.
 * It takes a request and a response object, generates an image based on the request body,
 * and sends the image URL in the response.
 *
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const messages: ChatRequestMessage[] = [
      {
        role: 'system',
        content:
          'Your primary role is to write prompts optimised for Open AI Dalle to generate images. Always create interesting ideas, only write the prompt itself rather than the instruction',
      },
      {
        role: 'user',
        content:
          "I want a random desciption of a fish! Please don't describe the environment or background",
      },
    ]

    const gptModel = process.env.AZURE_GPT_MODEL

    if (!gptModel) {
      throw new Error('No GPT Model defined in the environment variables')
    }

    // using openaiclient generate a Dallee prompt for a fish on a white background using azureopenai
    const { id, created, choices, usage } =
      await openaiClient.getChatCompletions(gptModel, messages)
    const response = choices[0].message?.content

    res.status(200).json({ response })
  } catch (error) {
    console.error('Error generating image:', error)
    res.status(500).json({ error: 'Error generating the image' })
  }
}
