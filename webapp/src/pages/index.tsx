import ThemeToggleButton from '@/components/buttons/ThemeToggleButton'
import ImageCard from '@/components/cards/ImageCard'
import TimedConfetti from '@/components/confetti/confetti'
import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  IconButton,
  Stack,
  Text,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useMutation, useQueries } from '@tanstack/react-query'
import { Dice6, Mic, Send } from 'lucide-react'
import Head from 'next/head'
import { useEffect, useState } from 'react'

import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition'

const createFish = async (inputStr: string) => {
  const response = await fetch('/api/images/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputstr: inputStr }),
  })
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}

const fetchRandomData = async () => {
  const response = await fetch('/api/ai/random')
  if (!response.ok) {
    throw new Error('Failed to fetch random data')
  }
  return await response.json()
}

const Home: React.FC = () => {
  const [inputStr, setInputStr] = useState('')
  const [sentStr, setSentStr] = useState('')
  const toast = useToast()
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    listening,
  } = useSpeechRecognition()
  const [fetch, setFetch] = useState(false)

  const fishQueries = useQueries({
    queries: Array.from({ length: 4 }, (_, index) => ({
      queryKey: ['/api/images/create', sentStr, index],
      queryFn: () => createFish(sentStr),
      enabled: fetch,
      retry: false,
      keepPreviousData: true, // Add this line
    })),
  })

  const {
    mutate: randomMutate,
    isPaused: randomLoading,
    isError: randomError,
    isSuccess: randomSuccess,
  } = useMutation({
    mutationFn: fetchRandomData,
    onMutate: () => {
      toast.close('success')
      toast({
        title: 'Loading...',
        description: 'Generating random fish',
        status: 'loading',
        id: 'loading',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Random fish generated',
        status: 'success',
        duration: 5000,
        isClosable: true,
        id: 'success',
      })
      setInputStr(data?.response ?? '')
    },
    onSettled: () => {
      // Remove loading toast
      toast.close('loading')
    },
  })

  const handleEnterPress = () => {
    if (inputStr.trim() !== '') {
      setFetch(true)
      setSentStr(inputStr)
    }
  }

  useEffect(() => {
    if (transcript !== '') {
      setInputStr(transcript)
    }
  }, [transcript])

  const handleMicClick = () => {
    if (browserSupportsSpeechRecognition) {
      if (listening) {
        SpeechRecognition.stopListening()
        setInputStr(transcript)
      } else {
        resetTranscript()
        SpeechRecognition.startListening({ continuous: true })
      }
    } else {
      toast({
        title: 'Speech recognition is not supported by your browser.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    }
  }

  // on completion of all queries, set fetch to false
  if (fetch && fishQueries.every((query) => query.isSuccess || query.isError)) {
    setFetch(false)
    setSentStr(inputStr)
  }

  const isComplete = fishQueries.every((query) => query.isSuccess)

  return (
    <Container
      p={10}
      maxW="container.xl"
      minH="100vh"
      justifyContent="center"
      centerContent
    >
      <Head>
        <title>Fish Generator</title>
      </Head>
      {
        <TimedConfetti
          show={isComplete}
          timeout={6}
        />
      }
      <ThemeToggleButton
        variant="ghost"
        size="lg"
        position="absolute"
        top="1%"
        right="1%"
      />
      <VStack
        w="100%"
        h="100%"
        justifyContent="center"
      >
        <Box w="100%">
          <Stack
            textAlign={'center'}
            spacing={8}
          >
            <Heading
              fontWeight="bold"
              fontSize={{ base: '5xl', md: '6xl' }}
              variant="gradient"
              p={1}
            >
              Create your fish using Generative AI!
            </Heading>
            <Text>
              Enter a description of a fish you would like to see, and we will
              do our best to create it using DALL-E 2 on Azure!
            </Text>
            <Center w="full">
              <Box
                pos="relative"
                w={{ base: '100%', md: '80%' }}
                as="form"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleEnterPress()
                }}
              >
                <Textarea
                  placeholder="Describe your idea..."
                  value={inputStr}
                  w="100%"
                  sx={{
                    resize: 'vertical; min-height: 8rem; max-height: 16rem;',
                  }}
                  onChange={(e) => setInputStr(e.target.value)}
                  size="lg"
                  fontSize="md"
                  isDisabled={fetch || listening}
                  pr="12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.shiftKey) {
                      e.preventDefault()
                      handleEnterPress()
                    }
                  }}
                />
                <VStack
                  pos="absolute"
                  top="50%"
                  right="3%"
                  zIndex={10}
                  transform="translateY(-50%)"
                  overflow="hidden"
                >
                  <IconButton
                    aria-label="transcript"
                    variant="ghost"
                    bg={listening ? 'gray.300' : 'initial'}
                    onClick={handleMicClick}
                    size="sm"
                    icon={<Mic size="15px" />}
                  />
                  <IconButton
                    aria-label="send"
                    variant="ghost"
                    isDisabled={randomLoading || fetch}
                    size="sm"
                    onClick={() => randomMutate()}
                    icon={<Dice6 size="15px" />}
                  />
                  <IconButton
                    aria-label="send"
                    variant="ghost"
                    isDisabled={inputStr.trim() === '' || fetch}
                    type="submit"
                    size="sm"
                    icon={<Send size="15px" />}
                  />
                </VStack>
              </Box>
            </Center>
          </Stack>
        </Box>

        <Button
          onClick={handleEnterPress}
          aria-label="send"
          colorScheme="blue"
          isDisabled={inputStr.trim() === '' || fetch}
          type="submit"
        >
          Generate!
        </Button>

        <Text>Select a fish! 💡</Text>

        <Center w="full">
          <Stack direction={['column', 'row']}>
            {fishQueries.map((query, index) => (
              <ImageCard
                query={query}
                index={index}
                key={index}
              />
            ))}
          </Stack>
        </Center>
      </VStack>

      <Text>
        Make sure your whole fish is in frame, and select your favourite. Feel
        free to try again if something is not quite right!
      </Text>

      <Box
        position="fixed"
        display="flex"
        w="100vw"
        h="100vh"
        justifyContent="center"
        zIndex={-100}
      ></Box>
    </Container>
  )
}

export default Home
