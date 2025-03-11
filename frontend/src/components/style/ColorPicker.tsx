import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Text,
  useColorModeValue,
  HStack,
  Tooltip,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
} from '@chakra-ui/react';
import { MdAddCircle, MdCheck } from 'react-icons/md';

// Predefined color palettes for quick selection
const PREDEFINED_PALETTES = [
  ['#FF5252', '#E040FB', '#7C4DFF'],  // Vibrant
  ['#FFD600', '#FF6D00', '#C51162'],  // Warm
  ['#00E676', '#00B0FF', '#651FFF'],  // Cool
  ['#212121', '#616161', '#9E9E9E'],  // Monochrome
  ['#FFEB3B', '#FFC107', '#FF9800'],  // Yellow/Orange
  ['#18FFFF', '#00E5FF', '#00B8D4'],  // Cyan
  ['#76FF03', '#64DD17', '#388E3C'],  // Green
  ['#F5F5F5', '#E0E0E0', '#9E9E9E'],  // Light
];

// Recent colors history
const RECENT_COLORS = [
  '#FF5252', '#E040FB', '#7C4DFF', '#00B0FF', '#00E676', 
  '#FFEB3B', '#FF6D00', '#212121', '#F5F5F5', '#18FFFF'
];

interface ColorPickerProps {
  colorPalette: string[];
  onChange: (colors: string[]) => void;
  maxColors?: number;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  colorPalette = [], 
  onChange, 
  maxColors = 3 
}) => {
  const [selectedColors, setSelectedColors] = useState<string[]>(colorPalette);
  const [currentColor, setCurrentColor] = useState<string>('#1f8de6');

  // Background colors for UI elements
  const boxBg = useColorModeValue('gray.700', 'gray.700');
  const cardBg = useColorModeValue('gray.800', 'gray.800');
  const activeBg = useColorModeValue('gray.600', 'gray.600');

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentColor(e.target.value);
  }, []);

  const addColor = useCallback(() => {
    if (selectedColors.length < maxColors) {
      const newColors = [...selectedColors, currentColor];
      setSelectedColors(newColors);
      onChange(newColors);
    }
  }, [selectedColors, currentColor, maxColors, onChange]);

  const removeColor = useCallback((index: number) => {
    const newColors = selectedColors.filter((_, i) => i !== index);
    setSelectedColors(newColors);
    onChange(newColors);
  }, [selectedColors, onChange]);

  const selectPredefinedPalette = useCallback((palette: string[]) => {
    setSelectedColors(palette.slice(0, maxColors));
    onChange(palette.slice(0, maxColors));
  }, [maxColors, onChange]);

  const selectColor = useCallback((color: string) => {
    if (selectedColors.length < maxColors) {
      const newColors = [...selectedColors, color];
      setSelectedColors(newColors);
      onChange(newColors);
    } else if (selectedColors.length > 0) {
      // Replace the last color
      const newColors = [...selectedColors.slice(0, -1), color];
      setSelectedColors(newColors);
      onChange(newColors);
    }
  }, [selectedColors, maxColors, onChange]);

  return (
    <Box>
      <Heading size="md" mb={4}>Color Palette</Heading>
      
      {/* Selected colors display */}
      <Flex mb={6} bg={boxBg} p={4} borderRadius="md" alignItems="center">
        {selectedColors.length > 0 ? (
          <>
            <HStack flex={1} spacing={3}>
              {selectedColors.map((color, index) => (
                <Tooltip key={index} label={color}>
                  <Box
                    w="50px"
                    h="50px"
                    bg={color}
                    borderRadius="md"
                    cursor="pointer"
                    position="relative"
                    onClick={() => removeColor(index)}
                    _hover={{
                      boxShadow: 'lg',
                      '&::after': {
                        content: '"×"',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '24px',
                        color: 'white',
                        textShadow: '0 0 3px rgba(0,0,0,0.7)',
                      }
                    }}
                  />
                </Tooltip>
              ))}
            </HStack>
            
            {selectedColors.length < maxColors && (
              <Tooltip label="Add Color">
                <Button
                  onClick={addColor}
                  leftIcon={<MdAddCircle />}
                  colorScheme="brand"
                  size="sm"
                  ml={3}
                >
                  Add
                </Button>
              </Tooltip>
            )}
          </>
        ) : (
          <Flex 
            direction="column" 
            align="center" 
            justify="center" 
            w="100%" 
            py={4}
          >
            <Text color="gray.400" mb={2}>No colors selected</Text>
            <Button
              onClick={addColor}
              leftIcon={<MdAddCircle />}
              colorScheme="brand"
              size="sm"
            >
              Add Color
            </Button>
          </Flex>
        )}
      </Flex>
      
      {/* Color picker and input */}
      <Flex mb={6} bg={boxBg} p={4} borderRadius="md" direction="column">
        <Text mb={2} fontWeight="medium">Custom Color</Text>
        <Flex alignItems="center">
          <Popover>
            <PopoverTrigger>
              <Box
                w="40px"
                h="40px"
                bg={currentColor}
                borderRadius="md"
                cursor="pointer"
                mr={3}
                boxShadow="sm"
              />
            </PopoverTrigger>
            <PopoverContent width="220px" bg={cardBg} borderColor="gray.600">
              <PopoverArrow bg={cardBg} />
              <PopoverBody p={4}>
                <Input
                  type="color"
                  value={currentColor}
                  onChange={handleColorChange}
                  width="100%"
                  height="40px"
                  padding={0}
                  border="none"
                  background="transparent"
                  cursor="pointer"
                />
              </PopoverBody>
            </PopoverContent>
          </Popover>
          
          <Input
            value={currentColor}
            onChange={handleColorChange}
            maxWidth="120px"
            bg="gray.700"
            mr={3}
          />
          
          <Button
            onClick={addColor}
            colorScheme="brand"
            isDisabled={selectedColors.length >= maxColors}
          >
            Add Color
          </Button>
        </Flex>
      </Flex>
      
      {/* Predefined palettes */}
      <Box mb={6} bg={boxBg} p={4} borderRadius="md">
        <Text mb={3} fontWeight="medium">Suggested Palettes</Text>
        <Grid templateColumns="repeat(2, 1fr)" gap={3}>
          {PREDEFINED_PALETTES.map((palette, paletteIndex) => (
            <Flex
              key={paletteIndex}
              bg={cardBg}
              p={2}
              borderRadius="md"
              cursor="pointer"
              _hover={{ bg: activeBg }}
              onClick={() => selectPredefinedPalette(palette)}
            >
              <HStack spacing={1} flex={1}>
                {palette.map((color, colorIndex) => (
                  <Box
                    key={colorIndex}
                    w="20px"
                    h="20px"
                    bg={color}
                    borderRadius="sm"
                  />
                ))}
              </HStack>
              <Button
                size="xs"
                colorScheme="brand"
                variant="ghost"
                rightIcon={<MdCheck />}
              >
                Use
              </Button>
            </Flex>
          ))}
        </Grid>
      </Box>
      
      {/* Recent colors */}
      <Box bg={boxBg} p={4} borderRadius="md">
        <Text mb={3} fontWeight="medium">Recent Colors</Text>
        <Flex flexWrap="wrap" gap={2}>
          {RECENT_COLORS.map((color, index) => (
            <Tooltip key={index} label={color}>
              <Box
                w="30px"
                h="30px"
                bg={color}
                borderRadius="md"
                cursor="pointer"
                onClick={() => selectColor(color)}
                _hover={{ transform: 'scale(1.1)', transition: 'transform 0.2s' }}
              />
            </Tooltip>
          ))}
        </Flex>
      </Box>
    </Box>
  );
};

export default ColorPicker;