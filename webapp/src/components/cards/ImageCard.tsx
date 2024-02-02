import {
  Image,
  Spinner,
  useColorModeValue,
  Center,
  useToast,
  Text,
  Box,
} from "@chakra-ui/react";
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import FishSubmissionModal from "../modal/CreateFish";

/**
 * ImageCard component.
 * It takes a query and an index as props, displays an image based on the query data,
 * and opens a modal with options to select the direction the fish is looking when the image is clicked.
 * After the direction is selected and the submit button is clicked, it sends a POST request to the '/api/file/upload' endpoint with the image URL and a filename.
 *
 * @param {UseQueryResult<any, Error>} query - The query object.
 * @param {Number} index - The index number.
 */

// Interface
interface ImageCardProps {
  query: UseQueryResult<any, Error>;
  index: Number;
}

const ImageCard = ({ query, index }: ImageCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const color = useColorModeValue("gray.100", "gray.900");

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  interface ImageData {
    url: string;
    filename: string;
  }

  const uploadMutation = useMutation({
    mutationFn: async (data: ImageData) => {
      const response = await fetch("/api/file/upload", {
        method: "POST",
        body: JSON.stringify({ url: data.url, filename: data.filename }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
  });

  let content;

  if (query.isLoading) {
    content = <Spinner />;
  } else if (query.isError) {
    content = (
      <Box textAlign="center">
        <Text> Error: Loading Image </Text>
      </Box>
    );
  } else if (query.isSuccess && query.data.url) {
    content = (
      <Image
        src={query.data.url}
        alt="Generated fish"
        htmlWidth="100%"
        htmlHeight="100%"
        rounded="lg"
        shadow="md"
        objectFit="cover"
        cursor="pointer"
        onClick={handleImageClick}
      />
    );
  }

  return (
    <Center
      maxW="52"
      w="100%"
      m="2"
      _hover={{
        transform: "scale(1.02)",
        transition: "ease-in .2s",
      }}
    >
      {content}
      <FishSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mutation={uploadMutation}
        data={query.data}
      />
    </Center>
  );
};

export default ImageCard;
