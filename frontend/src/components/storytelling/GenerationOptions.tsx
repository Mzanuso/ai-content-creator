import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  Text,
  useColorModeValue,
  Tooltip,
  HStack,
  Collapse,
  Icon,
} from '@chakra-ui/react';
import { FaChevronDown, FaChevronUp, FaCog, FaInfoCircle } from 'react-icons/fa';

export interface GenerationOptionsValues {
  tone: string;
  genre: string;
  targetAudience: string;
  formalityLevel: number;
  instructionalLevel: boolean;
}

interface GenerationOptionsProps {
  options: GenerationOptionsValues;
  onChange: (options: GenerationOptionsValues) => void;
  isDisabled?: boolean;
}

const GenerationOptions: React.FC<GenerationOptionsProps> = ({
  options,
  onChange,
  isDisabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleChange = (field: keyof GenerationOptionsValues, value: string | number | boolean) => {
    onChange({
      ...options,
      [field]: value,
    });
  };

  return (
    <Box bg="gray.800" p={4} borderRadius="md" w="100%">
      <Flex 
        justify="space-between" 
        align="center" 
        onClick={() => setIsOpen(!isOpen)}
        cursor="pointer"
        pb={2}
      >
        <HStack>
          <Icon as={FaCog} />
          <Text fontWeight="medium">Advanced Generation Options</Text>
        </HStack>
        <Icon as={isOpen ? FaChevronUp : FaChevronDown} />
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mt={2}>
          <FormControl isDisabled={isDisabled}>
            <FormLabel fontSize="sm" display="flex" alignItems="center">
              Tone
              <Tooltip label="The emotional quality of the screenplay">
                <span><Icon as={FaInfoCircle} ml={1} boxSize={3} /></span>
              </Tooltip>
            </FormLabel>
            <Select
              value={options.tone}
              onChange={(e) => handleChange('tone', e.target.value)}
              size="sm"
              bg="gray.700"
            >
              <option value="neutral">Neutral</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="inspirational">Inspirational</option>
              <option value="humorous">Humorous</option>
              <option value="dramatic">Dramatic</option>
              <option value="formal">Formal</option>
            </Select>
          </FormControl>

          <FormControl isDisabled={isDisabled}>
            <FormLabel fontSize="sm" display="flex" alignItems="center">
              Genre
              <Tooltip label="The style or category of the content">
                <span><Icon as={FaInfoCircle} ml={1} boxSize={3} /></span>
              </Tooltip>
            </FormLabel>
            <Select
              value={options.genre}
              onChange={(e) => handleChange('genre', e.target.value)}
              size="sm"
              bg="gray.700"
            >
              <option value="informational">Informational</option>
              <option value="promotional">Promotional</option>
              <option value="educational">Educational</option>
              <option value="entertainment">Entertainment</option>
              <option value="tutorial">Tutorial</option>
              <option value="documentary">Documentary-style</option>
              <option value="testimonial">Testimonial</option>
              <option value="storytelling">Storytelling</option>
            </Select>
          </FormControl>

          <FormControl isDisabled={isDisabled}>
            <FormLabel fontSize="sm" display="flex" alignItems="center">
              Target Audience
              <Tooltip label="Who the content is primarily aimed at">
                <span><Icon as={FaInfoCircle} ml={1} boxSize={3} /></span>
              </Tooltip>
            </FormLabel>
            <Select
              value={options.targetAudience}
              onChange={(e) => handleChange('targetAudience', e.target.value)}
              size="sm"
              bg="gray.700"
            >
              <option value="general">General</option>
              <option value="professionals">Professionals</option>
              <option value="experts">Industry Experts</option>
              <option value="students">Students</option>
              <option value="beginners">Beginners</option>
              <option value="consumers">Consumers</option>
              <option value="businesses">Businesses</option>
              <option value="technical">Technical Audience</option>
            </Select>
          </FormControl>

          <FormControl isDisabled={isDisabled}>
            <FormLabel fontSize="sm" display="flex" alignItems="center">
              Formality Level
              <Tooltip label="How formal or casual the language should be">
                <span><Icon as={FaInfoCircle} ml={1} boxSize={3} /></span>
              </Tooltip>
            </FormLabel>
            <HStack>
              <Text fontSize="xs">Casual</Text>
              <Slider
                aria-label="formality-level"
                defaultValue={options.formalityLevel}
                min={1}
                max={5}
                step={1}
                onChange={(val) => handleChange('formalityLevel', val)}
                isDisabled={isDisabled}
                colorScheme="brand"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <Text fontSize="xs">Formal</Text>
            </HStack>
          </FormControl>

          <FormControl isDisabled={isDisabled} display="flex" alignItems="center">
            <FormLabel fontSize="sm" mb="0" display="flex" alignItems="center">
              Instructional Focus
              <Tooltip label="Whether the content should focus on how-to steps and instructions">
                <span><Icon as={FaInfoCircle} ml={1} boxSize={3} /></span>
              </Tooltip>
            </FormLabel>
            <Switch
              colorScheme="brand"
              isChecked={options.instructionalLevel}
              onChange={(e) => handleChange('instructionalLevel', e.target.checked)}
              ml="auto"
            />
          </FormControl>
        </Grid>
      </Collapse>
    </Box>
  );
};

export default GenerationOptions;
