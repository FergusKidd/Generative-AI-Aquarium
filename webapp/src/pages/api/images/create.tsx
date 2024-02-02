import { openaiClient } from '@/library/openaiClient'
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
    const fishDesc = req.body.inputstr

    if (!fishDesc) {
      return res.status(400).json({ error: 'fishDesc is required' })
    }
    if (!openaiClient) {
      return res.status(400).json({ error: 'openaiClient is required' })
    }
    const deploymentName = process.env.AZURE_DALLE_DEPLOYMENT_NAME

    if (!deploymentName) {
      throw new Error(
        'No Dalle Deployment Name defined in the environment variables',
      )
    }

    const generateImage: GenerateImageResponse = (await openaiClient.getImages(
      deploymentName,
      'a not white in colour ' + fishDesc + 'on a plain white background',
      {
        n: 1,
        size: '1024x1024',
      },
    )) as any

    const url = generateImage.data[0].url

    res.status(200).json({ url })
  } catch (error) {
    console.error('Error generating image:', error)
    res.status(500).json({ error: 'Error generating the image' })
  }
}
