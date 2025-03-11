import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Stack,
  Text,
  HStack,
  VStack,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  useToast,
  Select,
  Divider,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { 
  FaPlay, 
  FaPause, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaExpandAlt, 
  FaCompress, 
  FaCog, 
  FaDownload, 
  FaShare, 
  FaChevronDown, 
  FaCheckCircle,
  FaRandom
} from 'react-icons/fa';

// Props for the VideoPreview component
interface VideoPreviewProps {
  videoUrl: string;
  onExport?: (options: ExportOptions) => void;
}

// Export options interface
interface ExportOptions {
  format: 'mp4' | 'webm' | 'gif';
  quality: 'low' | 'medium' | 'high';
  resolution: '480p' | '720p' | '1080p';
  includeAudio: boolean;
}

// Main VideoPreview component
const VideoPreview: React.FC<VideoPreviewProps> = ({ videoUrl, onExport }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'mp4',
    quality: 'high',
    resolution: '1080p',
    includeAudio: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  
  // Initialize video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    
    // Set initial volume
    video.volume = volume;
    
    // Clean up event listeners
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoUrl, volume]);
  
  // Toggle play/pause
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Handle timeline scrubbing
  const handleTimelineChange = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = value;
    setCurrentTime(value);
  };
  
  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = value;
    setVolume(value);
    
    if (value === 0) {
      setIsMuted(true);
      video.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  };
  
  // Format time to MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle export options change
  const handleExportOptionChange = (option: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };
  
  // Handle export button click
  const handleExport = () => {
    setIsLoading(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      setExportComplete(true);
      
      toast({
        title: "Export Complete",
        description: `Your video has been exported as ${exportOptions.resolution} ${exportOptions.format.toUpperCase()}.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      if (onExport) {
        onExport(exportOptions);
      }
      
      // Reset export complete status after a delay
      setTimeout(() => {
        setExportComplete(false);
      }, 3000);
    }, 3000);
  };
  
  return (
    <Box>
      <Heading size="md" mb={4}>Video Preview</Heading>
      <Text mb={6} color="gray.400">
        Preview your generated video and export it in your preferred format.
      </Text>
      
      {/* Video player */}
      <Box 
        ref={containerRef}
        bg="black" 
        borderRadius="md" 
        overflow="hidden"
        position="relative"
        mb={6}
      >
        <Box 
          as="video"
          ref={videoRef}
          src={videoUrl}
          width="100%"
          height="auto"
          maxHeight="500px"
          objectFit="contain"
          onClick={togglePlayPause}
          sx={{ aspectRatio: '16/9' }}
        />
        
        {/* Video controls overlay */}
        <Flex
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg="rgba(0, 0, 0, 0.7)"
          p={3}
          alignItems="center"
          opacity={1}
          transition="opacity 0.3s"
          _hover={{ opacity: 1 }}
        >
          {/* Play/Pause button */}
          <IconButton
            icon={isPlaying ? <FaPause /> : <FaPlay />}
            aria-label={isPlaying ? "Pause" : "Play"}
            variant="ghost"
            colorScheme="whiteAlpha"
            onClick={togglePlayPause}
            mr={2}
          />
          
          {/* Current time / Duration */}
          <Text color="white" fontSize="sm" mr={2}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
          
          {/* Progress slider */}
          <Box flex="1" mx={2}>
            <Slider
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleTimelineChange}
              colorScheme="brand"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb boxSize={3} />
            </Slider>
          </Box>
          
          {/* Volume control */}
          <Popover>
            <PopoverTrigger>
              <IconButton
                icon={isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                aria-label="Volume"
                variant="ghost"
                colorScheme="whiteAlpha"
                mr={2}
                onClick={toggleMute}
              />
            </PopoverTrigger>
            <PopoverContent bg="gray.800" borderColor="gray.700" width="200px">
              <PopoverArrow bg="gray.800" />
              <PopoverCloseButton />
              <PopoverHeader border="0" fontWeight="medium">Volume</PopoverHeader>
              <PopoverBody px={4} py={3}>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={handleVolumeChange}
                  colorScheme="brand"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={3} />
                </Slider>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          
          {/* Fullscreen button */}
          <IconButton
            icon={isFullscreen ? <FaCompress /> : <FaExpandAlt />}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            variant="ghost"
            colorScheme="whiteAlpha"
            onClick={toggleFullscreen}
          />
        </Flex>
      </Box>
      
      {/* Export options */}
      <Box bg="gray.700" p={6} borderRadius="md">
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading size="sm">Export Settings</Heading>
          <Button
            leftIcon={exportComplete ? <FaCheckCircle /> : <FaDownload />}
            colorScheme={exportComplete ? "green" : "brand"}
            isLoading={isLoading}
            loadingText="Exporting..."
            onClick={handleExport}
          >
            {exportComplete ? "Exported" : "Export Video"}
          </Button>
        </Flex>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl>
            <FormLabel>Format</FormLabel>
            <Select
              value={exportOptions.format}
              onChange={(e) => handleExportOptionChange('format', e.target.value)}
              bg="gray.600"
            >
              <option value="mp4">MP4</option>
              <option value="webm">WebM</option>
              <option value="gif">GIF</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel>Resolution</FormLabel>
            <Select
              value={exportOptions.resolution}
              onChange={(e) => handleExportOptionChange('resolution', e.target.value)}
              bg="gray.600"
            >
              <option value="1080p">1080p (HD)</option>
              <option value="720p">720p</option>
              <option value="480p">480p</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel>Quality</FormLabel>
            <Select
              value={exportOptions.quality}
              onChange={(e) => handleExportOptionChange('quality', e.target.value)}
              bg="gray.600"
            >
              <option value="high">High (larger file)</option>
              <option value="medium">Medium</option>
              <option value="low">Low (smaller file)</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel>Audio</FormLabel>
            <Stack direction="row">
              <Switch
                isChecked={exportOptions.includeAudio}
                onChange={(e) => handleExportOptionChange('includeAudio', e.target.checked)}
                colorScheme="brand"
              />
              <Text>Include audio in export</Text>
            </Stack>
          </FormControl>
        </SimpleGrid>
        
        <Divider my={6} borderColor="gray.600" />
        
        <VStack spacing={2} alignItems="flex-start">
          <Text fontSize="sm" color="gray.400">
            Estimated file size: {exportOptions.quality === 'high' ? '45-60 MB' : exportOptions.quality === 'medium' ? '20-30 MB' : '10-15 MB'}
          </Text>
          
          <Text fontSize="sm" color="gray.400">
            Note: Higher quality and resolution will result in larger file sizes and longer export times.
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

// Helper component for the grid layout
const SimpleGrid: React.FC<{
  columns: { base: number; md: number };
  spacing: number;
  children: React.ReactNode;
}> = ({ columns, spacing, children }) => {
  return (
    <Grid
      templateColumns={{
        base: `repeat(${columns.base}, 1fr)`,
        md: `repeat(${columns.md}, 1fr)`,
      }}
      gap={spacing}
    >
      {children}
    </Grid>
  );
};

// Grid component since it's not imported from Chakra UI
const Grid: React.FC<{
  templateColumns: { base: string; md: string };
  gap: number;
  children: React.ReactNode;
}> = ({ templateColumns, gap, children }) => {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: templateColumns.base, md: templateColumns.md }}
      gridGap={gap}
    >
      {children}
    </Box>
  );
};

export default VideoPreview;