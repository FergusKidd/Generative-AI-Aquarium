import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  RadioGroup,
  Stack,
  Radio,
  Text,
  useToast,
} from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import { UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";

interface FishDirectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mutation: UseMutationResult<any, Error, any>;
  data: any;
}

/**
 * FishDirectionModal component.
 * It takes isOpen, onClose, onSubmit, fishDirection, and setFishDirection as props,
 * and displays a modal with options to select the direction the fish is looking.
 * After the direction is selected and the submit button is clicked, it calls the onSubmit function.
 *
 * @param {FishDirectionModalProps} props - The props object.
 */
const FishSubmissionModal = ({
  isOpen,
  onClose,
  mutation,
  data,
}: FishDirectionModalProps) => {
  const toast = useToast();
  const [fishDirection, setFishDirection] = useState("left");

  const handleSubmit = async () => {
    const uid: string = uuidv4();
    const fileName = `${fishDirection}_${uid}.png`;
    const imageUrl = data.url;

    // Use the mutation
    mutation.mutate(
      { url: imageUrl, filename: fileName },
      {
        onSuccess: (data) => {
          // Handle success
          toast({
            title: "Success",
            description: "Image submitted",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          onClose();
        },
        onError: (error: Error) => {
          // Handle error
          toast({
            title: "Error",
            description: "Something went wrong",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          console.error("Error submitting image:", error);
        },
      }
    );
  };

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirm Your Action</ModalHeader>
        <ModalBody>
          <Text>Select the direction the fish is facing:</Text>
          <RadioGroup
            onChange={(e) => setFishDirection(e)}
            value={fishDirection}
          >
            <Stack direction="row">
              <Radio value="left">Left</Radio>
              <Radio value="right">Right</Radio>
            </Stack>
          </RadioGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleSubmit}
            isLoading={mutation.isPending}
          >
            Submit
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FishSubmissionModal;
