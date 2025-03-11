import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
  useColorModeValue,
  useToast,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FaRedo, FaSave, FaExclamationTriangle } from 'react-icons/fa';
import { 
  Screenplay as ScreenplayType,
  ScreenplaySection as ScreenplaySectionType 
} from '../../features/ai/aiSlice';
import ScreenplaySection from './ScreenplaySection';

interface ScreenplayEditorProps {
  screenplay: ScreenplayType | null;
  projectId: string;
  onSaveScreenplay: (screenplay: ScreenplayType) => void;
  onRegenerateAll: () => void;
  onRefineSection: (sectionId: string, instructions: string) => void;
  isLoading?: boolean;
}

const ScreenplayEditor: React.FC<ScreenplayEditorProps> = ({
  screenplay,
  projectId,
  onSaveScreenplay,
  onRegenerateAll,
  onRefineSection,
  isLoading = false,
}) => {
  const [localScreenplay, setLocalScreenplay] = useState<ScreenplayType | null>(screenplay);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Update local screenplay when prop changes
  useEffect(() => {
    if (screenplay) {
      setLocalScreenplay(screenplay);
      setHasUnsavedChanges(false);
    }
  }, [screenplay]);
  
  const handleSectionChange = (sectionId: string, text: string) => {
    if (!localScreenplay) return;
    
    const updatedSections = localScreenplay.sections.map(section => 
      section.id === sectionId ? { ...section, text } : section
    );
    
    setLocalScreenplay({
      ...localScreenplay,
      sections: updatedSections,
    });
    
    setHasUnsavedChanges(true);
  };
  
  const handleSaveScreenplay = () => {
    if (!localScreenplay) return;
    
    onSaveScreenplay(localScreenplay);
    setHasUnsavedChanges(false);
    
    toast({
      title: 'Screenplay saved',
      description: 'Your screenplay has been saved successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleRegenerateAll = () => {
    // If there are unsaved changes, confirm first
    if (hasUnsavedChanges) {
      onOpen();
    } else {
      onRegenerateAll();
    }
  };
  
  const confirmRegeneration = () => {
    onClose();
    onRegenerateAll();
  };

  // Render empty state if no screenplay
  if (!localScreenplay || !localScreenplay.sections || localScreenplay.sections.length === 0) {
    return (
      <Box>
        <Alert status="info" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle mr={2}>No screenplay yet</AlertTitle>
          <AlertDescription>Generate a screenplay by entering a concept and clicking "Generate Screenplay".</AlertDescription>
        </Alert>
        
        <VStack spacing={4}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height="200px" width="100%" borderRadius="md" />
          ))}
        </VStack>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">Screenplay Editor</Heading>
        
        <HStack>
          {hasUnsavedChanges && (
            <Text color="yellow.500" fontSize="sm" fontStyle="italic">
              You have unsaved changes
            </Text>
          )}
          
          <Button
            colorScheme="blue"
            variant="outline"
            leftIcon={<FaRedo />}
            onClick={handleRegenerateAll}
            isLoading={isLoading}
            loadingText="Regenerating..."
          >
            Regenerate All
          </Button>
          
          <Button
            colorScheme="brand"
            leftIcon={<FaSave />}
            onClick={handleSaveScreenplay}
            isDisabled={!hasUnsavedChanges}
          >
            Save Screenplay
          </Button>
        </HStack>
      </Flex>
      
      {/* Concept display */}
      {localScreenplay.concept && (
        <Box mb={6} p={4} bg="gray.700" borderRadius="md">
          <Text fontWeight="medium" mb={1}>Concept:</Text>
          <Text>{localScreenplay.concept}</Text>
        </Box>
      )}
      
      {/* Sections */}
      <VStack spacing={6} align="stretch">
        {localScreenplay.sections.map((section, index) => (
          <ScreenplaySection
            key={section.id}
            section={section}
            sectionIndex={index}
            onChange={handleSectionChange}
            onRefine={onRefineSection}
            isLoading={isLoading}
          />
        ))}
      </VStack>
      
      {/* Save button at bottom for convenience */}
      {hasUnsavedChanges && (
        <Flex justify="center" mt={8}>
          <Button
            colorScheme="brand"
            size="lg"
            leftIcon={<FaSave />}
            onClick={handleSaveScreenplay}
            px={10}
          >
            Save All Changes
          </Button>
        </Flex>
      )}
      
      {/* Confirmation modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader>Unsaved Changes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack>
              <FaExclamationTriangle color="yellow" />
              <Text>
                You have unsaved changes to your screenplay. Regenerating will overwrite all your current changes.
              </Text>
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmRegeneration}>
              Regenerate Anyway
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ScreenplayEditor;
