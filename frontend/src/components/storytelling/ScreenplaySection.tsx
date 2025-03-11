import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Textarea,
  Badge,
  IconButton,
  HStack,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Tooltip,
} from '@chakra-ui/react';
import { FaEdit, FaUndo, FaSave, FaRedo, FaRegLightbulb, FaSearch, FaInfoCircle } from 'react-icons/fa';
import { ScreenplaySection as ScreenplaySectionType } from '../../features/ai/aiSlice';

interface ScreenplaySectionProps {
  section: ScreenplaySectionType;
  sectionIndex: number;
  onChange: (sectionId: string, text: string) => void;
  onRefine: (sectionId: string, instructions: string) => void;
  isLoading?: boolean;
}

const ScreenplaySection: React.FC<ScreenplaySectionProps> = ({
  section,
  sectionIndex,
  onChange,
  onRefine,
  isLoading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(section.text);
  const [originalText, setOriginalText] = useState(section.text);
  const [refineInstructions, setRefineInstructions] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Initialize text when section changes
  useEffect(() => {
    setText(section.text);
    setOriginalText(section.text);
  }, [section]);

  // Auto-focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (text.trim() === '') {
      toast({
        title: 'Cannot save empty section',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    onChange(section.id, text);
    setOriginalText(text);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setText(originalText);
    setIsEditing(false);
  };

  const handleRefine = () => {
    if (refineInstructions.trim() === '') {
      toast({
        title: 'Instructions required',
        description: 'Please provide instructions for refining this section.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    onRefine(section.id, refineInstructions);
    setRefineInstructions('');
    onClose();
  };

  const getSectionTitle = (index: number) => {
    const titles = [
      'Introduction',
      'Development',
      'Main Point',
      'Explanation',
      'Conclusion',
    ];
    return titles[index] || `Section ${index + 1}`;
  };

  return (
    <Box
      bg="gray.800"
      borderRadius="md"
      overflow="hidden"
      borderWidth="1px"
      borderColor="gray.700"
    >
      {/* Section header */}
      <Flex
        bg="gray.700"
        p={3}
        alignItems="center"
        justifyContent="space-between"
      >
        <HStack>
          <Badge colorScheme="brand" px={2} py={1} borderRadius="md">
            {sectionIndex + 1}
          </Badge>
          <Text fontWeight="bold">{getSectionTitle(sectionIndex)}</Text>
          
          <Tooltip label="Each screenplay is divided into 5 sections that form a cohesive narrative. This structure helps create a logical flow for your video content.">
            <Box display="inline-block" ml={1}>
              <FaInfoCircle size={14} />
            </Box>
          </Tooltip>
        </HStack>

        <HStack>
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<FaUndo />}
                onClick={handleCancel}
                colorScheme="red"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<FaSave />}
                onClick={handleSave}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
                <PopoverTrigger>
                  <Button
                    size="sm"
                    leftIcon={<FaRegLightbulb />}
                    variant="ghost"
                    colorScheme="yellow"
                    isDisabled={isLoading}
                  >
                    Refine
                  </Button>
                </PopoverTrigger>
                <PopoverContent bg="gray.700" borderColor="gray.600">
                  <PopoverArrow bg="gray.700" />
                  <PopoverCloseButton />
                  <PopoverHeader borderBottomColor="gray.600">
                    Refine this section
                  </PopoverHeader>
                  <PopoverBody>
                    <FormControl>
                      <FormLabel fontSize="sm">
                        How would you like to improve this section?
                      </FormLabel>
                      <Input
                        placeholder="e.g., Make it more concise, Add more emotion, etc."
                        value={refineInstructions}
                        onChange={(e) => setRefineInstructions(e.target.value)}
                        mb={3}
                        bg="gray.600"
                      />
                      <Button
                        size="sm"
                        colorScheme="brand"
                        onClick={handleRefine}
                        isLoading={isLoading}
                        isFullWidth
                      >
                        Apply Refinement
                      </Button>
                    </FormControl>
                  </PopoverBody>
                </PopoverContent>
              </Popover>

              <IconButton
                aria-label="Edit section"
                icon={<FaEdit />}
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              />
            </>
          )}
        </HStack>
      </Flex>

      {/* Section content */}
      <Box p={4}>
        {isEditing ? (
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            minH="150px"
            bg="gray.700"
            resize="vertical"
          />
        ) : (
          <Text whiteSpace="pre-wrap">{text}</Text>
        )}
      </Box>

      {/* Character count if editing */}
      {isEditing && (
        <Box px={4} pb={2} textAlign="right">
          <Text fontSize="sm" color="gray.400">
            {text.length} characters
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default ScreenplaySection;
