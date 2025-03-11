import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Stack,
  Select,
  SimpleGrid,
  Badge,
  Card,
  CardBody,
  CardFooter,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
  useToast,
  VStack,
  Divider,
  HStack,
  Radio,
  RadioGroup,
  Tag,
  TagLabel,
  TagCloseButton,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { 
  FaMusic, 
  FaPlay, 
  FaPause, 
  FaStop, 
  FaRandom, 
  FaCog, 
  FaCheck, 
  FaTimes, 
  FaPlus, 
  FaVolumeUp,
  FaSearch,
} from 'react-icons/fa';
import { AudioData } from './AudioTab';

// Props for the MusicGenerator component
interface MusicGeneratorProps {
  onMusicGenerated: (music: AudioData['musicTrack']) => void;
  currentMusic?: AudioData['musicTrack'];
}

// Music genre type
type MusicGenre = 
  'cinematic' | 
  'electronic' | 
  'acoustic' | 
  'ambient' | 
  'jazz' | 
  'pop' | 
  'rock' | 
  'classical' | 
  'lo-fi';

// Music mood type
type MusicMood = 
  'uplifting' | 
  'inspirational' | 
  'dramatic' | 
  'tense' | 
  'sad' | 
  'happy' | 
  'mysterious' | 
  'relaxing' | 
  'energetic';

// Music preset type
interface MusicPreset {
  id: string;
  name: string;
  genre: MusicGenre;
  mood: MusicMood;
  tempo: number; // 0-100
  complexity: number; // 0-100
  tags: string[];
  previewUrl?: string;
}

// Sample music presets
const MUSIC_PRESETS: MusicPreset[] = [
  {
    id: 'preset-1',
    name: 'Epic Cinematic',
    genre: 'cinematic',
    mood: 'dramatic',
    tempo: 70,
    complexity: 80,
    tags: ['orchestra', 'powerful', 'trailer'],
    previewUrl: 'https://example.com/samples/epic-cinematic.mp3'
  },
  {
    id: 'preset-2',
    name: 'Corporate Motivation',
    genre: 'electronic',
    mood: 'uplifting',
    tempo: 65,
    complexity: 60,
    tags: ['business', 'technology', 'forward-thinking'],
    previewUrl: 'https://example.com/samples/corporate-motivation.mp3'
  },
  {
    id: 'preset-3',
    name: 'Gentle Acoustic',
    genre: 'acoustic',
    mood: 'relaxing',
    tempo: 50,
    complexity: 40,
    tags: ['guitar', 'soft', 'natural'],
    previewUrl: 'https://example.com/samples/gentle-acoustic.mp3'
  },
  {
    id: 'preset-4',
    name: 'Ambient Atmosphere',
    genre: 'ambient',
    mood: 'mysterious',
    tempo: 30,
    complexity: 20,
    tags: ['atmospheric', 'background', 'subtle'],
    previewUrl: 'https://example.com/samples/ambient-atmosphere.mp3'
  },
  {
    id: 'preset-5',
    name: 'Lo-fi Beats',
    genre: 'lo-fi',
    mood: 'relaxing',
    tempo: 45,
    complexity: 35,
    tags: ['chill', 'hip-hop', 'nostalgic'],
    previewUrl: 'https://example.com/samples/lo-fi-beats.mp3'
  },
  {
    id: 'preset-6',
    name: 'Energetic Pop',
    genre: 'pop',
    mood: 'energetic',
    tempo: 85,
    complexity: 65,
    tags: ['commercial', 'catchy', 'modern'],
    previewUrl: 'https://example.com/samples/energetic-pop.mp3'
  },
];

// Main MusicGenerator component
const MusicGenerator: React.FC<MusicGeneratorProps> = ({ onMusicGenerated, currentMusic }) => {
  const [selectedPreset, setSelectedPreset] = useState<MusicPreset | null>(null);
  const [customSettings, setCustomSettings] = useState<{
    genre: MusicGenre;
    mood: MusicMood;
    tempo: number;
    complexity: number;
    tags: string[];
  }>({
    genre: 'cinematic',
    mood: 'uplifting',
    tempo: 60,
    complexity: 50,
    tags: [],
  });
  const [newTag, setNewTag] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMusic, setGeneratedMusic] = useState<AudioData['musicTrack'] | undefined>(currentMusic);
  const [filterText, setFilterText] = useState('');
  const [showTempoTooltip, setShowTempoTooltip] = useState(false);
  const [showComplexityTooltip, setShowComplexityTooltip] = useState(false);
  
  const toast = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
    });
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', () => {
          setIsPlaying(false);
        });
      }
    };
  }, []);
  
  // Reset selected preset when filter changes
  useEffect(() => {
    setSelectedPreset(null);
  }, [filterText]);
  
  // Handle audio playback
  const handlePlayPause = (previewUrl?: string) => {
    if (!audioRef.current) return;
    
    // If new preview URL is provided, change the source
    if (previewUrl && previewUrl !== currentPreviewUrl) {
      audioRef.current.pause();
      audioRef.current.src = previewUrl;
      setCurrentPreviewUrl(previewUrl);
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }
    
    // Otherwise toggle play/pause of current audio
    if (isPlaying) {
      audioRef.current.pause();
    } else if (currentPreviewUrl) {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Stop playback
  const handleStop = () => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };
  
  // Handle preset selection
  const handlePresetSelect = (preset: MusicPreset) => {
    setSelectedPreset(preset);
    setCustomSettings({
      genre: preset.genre,
      mood: preset.mood,
      tempo: preset.tempo,
      complexity: preset.complexity,
      tags: [...preset.tags],
    });
    
    // Play the preset preview
    if (preset.previewUrl) {
      handlePlayPause(preset.previewUrl);
    }
  };
  
  // Handle custom settings changes
  const handleSettingChange = (setting: keyof typeof customSettings, value: any) => {
    setCustomSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    // Deselect preset when changing settings manually
    if (selectedPreset) {
      setSelectedPreset(null);
    }
  };
  
  // Add a tag
  const handleAddTag = () => {
    if (newTag && !customSettings.tags.includes(newTag)) {
      setCustomSettings(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
      
      // Deselect preset when adding tags manually
      if (selectedPreset) {
        setSelectedPreset(null);
      }
    }
  };
  
  // Remove a tag
  const handleRemoveTag = (tag: string) => {
    setCustomSettings(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
    
    // Deselect preset when removing tags manually
    if (selectedPreset) {
      setSelectedPreset(null);
    }
  };
  
  // Generate random settings
  const handleRandomize = () => {
    // Stop current playback
    handleStop();
    
    // Deselect current preset
    setSelectedPreset(null);
    
    // Generate random settings
    const genres: MusicGenre[] = ['cinematic', 'electronic', 'acoustic', 'ambient', 'jazz', 'pop', 'rock', 'classical', 'lo-fi'];
    const moods: MusicMood[] = ['uplifting', 'inspirational', 'dramatic', 'tense', 'sad', 'happy', 'mysterious', 'relaxing', 'energetic'];
    
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    const randomTempo = Math.floor(Math.random() * 100);
    const randomComplexity = Math.floor(Math.random() * 100);
    
    // Get 1-3 random tags from a preset that matches the genre or mood
    const matchingPresets = MUSIC_PRESETS.filter(
      p => p.genre === randomGenre || p.mood === randomMood
    );
    
    let randomTags: string[] = [];
    if (matchingPresets.length > 0) {
      const preset = matchingPresets[Math.floor(Math.random() * matchingPresets.length)];
      const tagsCount = Math.floor(Math.random() * 3) + 1; // 1-3 tags
      randomTags = preset.tags.slice(0, tagsCount);
    }
    
    setCustomSettings({
      genre: randomGenre,
      mood: randomMood,
      tempo: randomTempo,
      complexity: randomComplexity,
      tags: randomTags,
    });
    
    toast({
      title: 'Settings Randomized',
      description: 'Try generating music with these random settings!',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Generate music based on current settings
  const handleGenerateMusic = () => {
    // Stop current playback
    handleStop();
    
    setIsGenerating(true);
    
    // Simulate API call to generate music
    setTimeout(() => {
      // Mock generated music data
      const mockMusic = {
        url: 'https://example.com/generated-music.mp3',
        name: selectedPreset ? selectedPreset.name : `Custom ${customSettings.mood} ${customSettings.genre}`,
        duration: 120, // 2 minutes
      };
      
      setGeneratedMusic(mockMusic);
      setCurrentPreviewUrl(mockMusic.url);
      
      // Notify parent component
      onMusicGenerated(mockMusic);
      
      setIsGenerating(false);
      
      // Auto-play the generated music
      handlePlayPause(mockMusic.url);
      
      toast({
        title: 'Music Generated',
        description: 'Your custom background music has been generated successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }, 3000);
  };
  
  // Filter presets based on search text
  const filteredPresets = MUSIC_PRESETS.filter(preset => {
    if (!filterText) return true;
    
    const lowerFilter = filterText.toLowerCase();
    return (
      preset.name.toLowerCase().includes(lowerFilter) ||
      preset.genre.toLowerCase().includes(lowerFilter) ||
      preset.mood.toLowerCase().includes(lowerFilter) ||
      preset.tags.some(tag => tag.toLowerCase().includes(lowerFilter))
    );
  });
  
  return (
    <Stack spacing={6}>
      <VStack spacing={1} align="flex-start">
        <Heading size="md">Background Music</Heading>
        <Text color="gray.400">
          Generate custom background music or select from preset styles.
        </Text>
      </VStack>
      
      {/* Generated Music Player (if available) */}
      {generatedMusic && (
        <Box bg="gray.700" p={4} borderRadius="md" mb={4}>
          <Flex alignItems="center" justifyContent="space-between">
            <Box>
              <Heading size="sm" mb={1}>{generatedMusic.name}</Heading>
              <Text fontSize="sm" color="gray.400">Duration: {Math.floor(generatedMusic.duration / 60)}:{(generatedMusic.duration % 60).toString().padStart(2, '0')}</Text>
            </Box>
            
            <HStack>
              <IconButton
                icon={isPlaying ? <FaPause /> : <FaPlay />}
                aria-label={isPlaying ? "Pause" : "Play"}
                colorScheme="brand"
                onClick={() => handlePlayPause(generatedMusic.url)}
              />
              <IconButton
                icon={<FaStop />}
                aria-label="Stop"
                variant="outline"
                onClick={handleStop}
              />
            </HStack>
          </Flex>
          
          <Divider my={4} />
          
          <Text fontSize="sm" fontStyle="italic">
            This music is now linked to your project. You can adjust volume and sync with video in the Audio Mixer tab.
          </Text>
        </Box>
      )}
      
      {/* Music Presets */}
      <Box>
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Heading size="sm">Music Presets</Heading>
          <InputGroup size="sm" maxW="200px">
            <Input
              placeholder="Search presets..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              bg="gray.700"
            />
            <InputRightElement>
              <FaSearch color="gray.300" />
            </InputRightElement>
          </InputGroup>
        </Flex>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={6}>
          {filteredPresets.map(preset => (
            <Card 
              key={preset.id} 
              bg={selectedPreset?.id === preset.id ? 'gray.600' : 'gray.700'}
              border="1px solid"
              borderColor={selectedPreset?.id === preset.id ? 'brand.500' : 'gray.700'}
              cursor="pointer"
              onClick={() => handlePresetSelect(preset)}
              _hover={{ borderColor: 'brand.400' }}
              transition="all 0.2s"
            >
              <CardBody py={3}>
                <Flex justifyContent="space-between" alignItems="center" mb={2}>
                  <Heading size="sm" noOfLines={1}>{preset.name}</Heading>
                  {selectedPreset?.id === preset.id && (
                    <Badge colorScheme="brand">Selected</Badge>
                  )}
                </Flex>
                
                <HStack mb={2}>
                  <Badge colorScheme="purple">{preset.genre}</Badge>
                  <Badge colorScheme="blue">{preset.mood}</Badge>
                </HStack>
                
                <HStack spacing={1} flexWrap="wrap">
                  {preset.tags.map(tag => (
                    <Tag key={tag} size="sm" variant="subtle" colorScheme="gray" mb={1}>
                      <TagLabel>{tag}</TagLabel>
                    </Tag>
                  ))}
                </HStack>
              </CardBody>
              
              <CardFooter pt={0} pb={3}>
                <Button 
                  leftIcon={isPlaying && currentPreviewUrl === preset.previewUrl ? <FaPause /> : <FaPlay />} 
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPause(preset.previewUrl);
                  }}
                >
                  Preview
                </Button>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      </Box>
      
      {/* Custom Settings */}
      <Box bg="gray.700" p={6} borderRadius="md">
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Heading size="sm">Custom Settings</Heading>
          <Button
            leftIcon={<FaRandom />}
            size="sm"
            onClick={handleRandomize}
          >
            Randomize
          </Button>
        </Flex>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
          <Box>
            <Text mb={2} fontWeight="medium">Genre</Text>
            <Select
              value={customSettings.genre}
              onChange={(e) => handleSettingChange('genre', e.target.value)}
              bg="gray.600"
            >
              <option value="cinematic">Cinematic</option>
              <option value="electronic">Electronic</option>
              <option value="acoustic">Acoustic</option>
              <option value="ambient">Ambient</option>
              <option value="jazz">Jazz</option>
              <option value="pop">Pop</option>
              <option value="rock">Rock</option>
              <option value="classical">Classical</option>
              <option value="lo-fi">Lo-fi</option>
            </Select>
          </Box>
          
          <Box>
            <Text mb={2} fontWeight="medium">Mood</Text>
            <Select
              value={customSettings.mood}
              onChange={(e) => handleSettingChange('mood', e.target.value)}
              bg="gray.600"
            >
              <option value="uplifting">Uplifting</option>
              <option value="inspirational">Inspirational</option>
              <option value="dramatic">Dramatic</option>
              <option value="tense">Tense</option>
              <option value="sad">Sad</option>
              <option value="happy">Happy</option>
              <option value="mysterious">Mysterious</option>
              <option value="relaxing">Relaxing</option>
              <option value="energetic">Energetic</option>
            </Select>
          </Box>
          
          <Box>
            <Flex justify="space-between">
              <Text mb={2} fontWeight="medium">Tempo</Text>
              <Text fontSize="sm" color="gray.400">{customSettings.tempo}</Text>
            </Flex>
            <Slider
              min={0}
              max={100}
              step={1}
              value={customSettings.tempo}
              onChange={(val) => handleSettingChange('tempo', val)}
              onMouseEnter={() => setShowTempoTooltip(true)}
              onMouseLeave={() => setShowTempoTooltip(false)}
              colorScheme="brand"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <Tooltip
                hasArrow
                bg="brand.500"
                color="white"
                placement="top"
                isOpen={showTempoTooltip}
                label={`Tempo: ${customSettings.tempo} BPM`}
              >
                <SliderThumb />
              </Tooltip>
            </Slider>
            <Flex justify="space-between" mt={1}>
              <Text fontSize="xs" color="gray.500">Slow</Text>
              <Text fontSize="xs" color="gray.500">Fast</Text>
            </Flex>
          </Box>
          
          <Box>
            <Flex justify="space-between">
              <Text mb={2} fontWeight="medium">Complexity</Text>
              <Text fontSize="sm" color="gray.400">{customSettings.complexity}</Text>
            </Flex>
            <Slider
              min={0}
              max={100}
              step={1}
              value={customSettings.complexity}
              onChange={(val) => handleSettingChange('complexity', val)}
              onMouseEnter={() => setShowComplexityTooltip(true)}
              onMouseLeave={() => setShowComplexityTooltip(false)}
              colorScheme="brand"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <Tooltip
                hasArrow
                bg="brand.500"
                color="white"
                placement="top"
                isOpen={showComplexityTooltip}
                label={`Complexity: ${customSettings.complexity}%`}
              >
                <SliderThumb />
              </Tooltip>
            </Slider>
            <Flex justify="space-between" mt={1}>
              <Text fontSize="xs" color="gray.500">Simple</Text>
              <Text fontSize="xs" color="gray.500">Complex</Text>
            </Flex>
          </Box>
        </SimpleGrid>
        
        <Box mb={6}>
          <Text mb={2} fontWeight="medium">Keywords/Tags</Text>
          <Flex mb={3}>
            <Input
              placeholder="Add a keyword..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              mr={2}
              bg="gray.600"
            />
            <Button onClick={handleAddTag} leftIcon={<FaPlus />}>
              Add
            </Button>
          </Flex>
          
          <Flex flexWrap="wrap" gap={2}>
            {customSettings.tags.length === 0 ? (
              <Text fontSize="sm" color="gray.500">No keywords added yet. Keywords help fine-tune the music generation.</Text>
            ) : (
              customSettings.tags.map(tag => (
                <Tag key={tag} size="md" colorScheme="brand" borderRadius="full">
                  <TagLabel>{tag}</TagLabel>
                  <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                </Tag>
              ))
            )}
          </Flex>
        </Box>
        
        <Button
          onClick={handleGenerateMusic}
          colorScheme="brand"
          size="lg"
          width="100%"
          isLoading={isGenerating}
          loadingText="Generating Music..."
          leftIcon={<FaMusic />}
        >
          Generate Background Music
        </Button>
      </Box>
    </Stack>
  );
};

// Helper component for the grid layout
const SimpleGrid: React.FC<{
  columns: { base: number; md: number; lg?: number };
  spacing: number;
  mb?: number;
  children: React.ReactNode;
}> = ({ columns, spacing, mb, children }) => {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{
        base: `repeat(${columns.base}, 1fr)`,
        md: `repeat(${columns.md}, 1fr)`,
        lg: columns.lg ? `repeat(${columns.lg}, 1fr)` : undefined,
      }}
      gridGap={spacing}
      mb={mb}
    >
      {children}
    </Box>
  );
};

export default MusicGenerator;