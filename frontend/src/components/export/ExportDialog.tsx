import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Box,
  Flex,
  Stack,
  VStack,
  Heading,
  Text,
  Select,
  Switch,
  FormControl,
  FormLabel,
  Divider,
  Progress,
  Checkbox,
  HStack,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  IconButton,
  InputGroup,
  Input,
  InputRightAddon,
  Tooltip,
  Badge,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import {
  FaDownload,
  FaShareAlt,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaYoutube,
  FaVimeo,
  FaInstagram,
  FaLink,
  FaCopy,
  FaVideo,
  FaFileExport,
  FaCog,
  FaChevronRight,
  FaChevronLeft,
  FaFile,
  FaCompress,
  FaCheck,
  FaTimes,
} from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';

// Types for the component props
interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  videoUrl?: string;
  audioUrl?: string;
}

// Export format options
type ExportFormat = 'mp4' | 'webm' | 'mov' | 'gif';
type ExportQuality = 'low' | 'medium' | 'high' | 'ultra';
type ExportResolution = '480p' | '720p' | '1080p' | '4k';

// Export configuration interface
interface ExportConfig {
  format: ExportFormat;
  quality: ExportQuality;
  resolution: ExportResolution;
  fps: number;
  includeAudio: boolean;
  compressFile: boolean;
  addWatermark: boolean;
  optimizeForWeb: boolean;
}

// Social sharing configuration
interface SharingConfig {
  platform: 'youtube' | 'vimeo' | 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'direct';
  visibility: 'public' | 'unlisted' | 'private';
  title: string;
  description: string;
  tags: string[];
}

// Processing step type
type ProcessingStep = 'queued' | 'rendering' | 'encoding' | 'finalizing' | 'completed' | 'error';

// Main export dialog component
const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  projectId,
  videoUrl,
  audioUrl,
}) => {
  // State for the export configuration
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'mp4',
    quality: 'high',
    resolution: '1080p',
    fps: 30,
    includeAudio: true,
    compressFile: true,
    addWatermark: false,
    optimizeForWeb: true,
  });

  // State for the sharing configuration
  const [sharingConfig, setSharingConfig] = useState<SharingConfig>({
    platform: 'direct',
    visibility: 'unlisted',
    title: '',
    description: '',
    tags: [],
  });

  // State for the processing status
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<ProcessingStep>('queued');
  const [progress, setProgress] = useState(0);
  const [exportUrl, setExportUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const [directLinkCopied, setDirectLinkCopied] = useState(false);

  const toast = useToast();
  const dispatch = useAppDispatch();

  // Get project data from Redux store
  const { project } = useAppSelector((state) => state.projects);

  // Initialize project title and description for sharing
  useEffect(() => {
    if (project) {
      setSharingConfig(prev => ({
        ...prev,
        title: project.title || 'My AI Generated Video',
        description: project.description || 'Created with AI Content Creator',
      }));
    }
  }, [project]);

  // Handle export configuration changes
  const handleExportConfigChange = (field: keyof ExportConfig, value: any) => {
    setExportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle sharing configuration changes
  const handleSharingConfigChange = (field: keyof SharingConfig, value: any) => {
    setSharingConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add a tag to the list
  const addTag = () => {
    if (tagInput.trim() && !sharingConfig.tags.includes(tagInput.trim())) {
      handleSharingConfigChange('tags', [...sharingConfig.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Remove a tag from the list
  const removeTag = (tagToRemove: string) => {
    handleSharingConfigChange(
      'tags',
      sharingConfig.tags.filter(tag => tag !== tagToRemove)
    );
  };

  // Copy direct link to clipboard
  const copyDirectLink = () => {
    if (exportUrl) {
      navigator.clipboard.writeText(exportUrl);
      setDirectLinkCopied(true);
      
      toast({
        title: 'Link Copied',
        description: 'Direct link has been copied to your clipboard.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setTimeout(() => {
        setDirectLinkCopied(false);
      }, 3000);
    }
  };

  // Start the export process
  const startExport = () => {
    setIsProcessing(true);
    setProcessStep('queued');
    setProgress(0);
    setExportUrl('');

    // Simulate the export process
    const simulateExport = async () => {
      // Queued step
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProcessStep('rendering');
      
      // Rendering step (progress from 0% to 50%)
      for (let i = 0; i <= 50; i += 5) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setProcessStep('encoding');
      
      // Encoding step (progress from 50% to 80%)
      for (let i = 55; i <= 80; i += 5) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      setProcessStep('finalizing');
      
      // Finalizing step (progress from 80% to 100%)
      for (let i = 85; i <= 100; i += 5) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      // Set the mock export URL
      setExportUrl('https://example.com/exports/my-ai-video.' + exportConfig.format);
      setProcessStep('completed');

      toast({
        title: 'Export Completed',
        description: `Your video has been successfully exported as ${exportConfig.resolution} ${exportConfig.format.toUpperCase()}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Automatically switch to sharing tab
      setActiveTab(1);
    };

    // Start the simulation
    simulateExport().catch(error => {
      console.error('Export error:', error);
      setProcessStep('error');
      
      toast({
        title: 'Export Failed',
        description: 'There was an error during the export process. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    });

    // In a real app, we would dispatch an async action to export the video:
    // dispatch(exportVideo({ projectId, config: exportConfig }))
    //   .unwrap()
    //   .then(result => {
    //     setExportUrl(result.url);
    //     setProcessStep('completed');
    //     setActiveTab(1);
    //   })
    //   .catch(error => {
    //     setProcessStep('error');
    //   });
  };

  // Share the exported video
  const shareVideo = () => {
    // Simulate the sharing process
    toast({
      title: 'Sharing In Progress',
      description: `Your video is being shared on ${sharingConfig.platform}...`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });

    setTimeout(() => {
      toast({
        title: 'Video Shared',
        description: `Your video has been successfully shared on ${sharingConfig.platform}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }, 2000);

    // In a real app, we would dispatch an async action to share the video:
    // dispatch(shareVideo({ projectId, exportUrl, config: sharingConfig }))
  };

  // Calculate the estimated file size based on the export configuration
  const calculateEstimatedFileSize = (): string => {
    const resolutionFactor = 
      exportConfig.resolution === '4k' ? 8 :
      exportConfig.resolution === '1080p' ? 2 :
      exportConfig.resolution === '720p' ? 1 : 0.5;
    
    const qualityFactor = 
      exportConfig.quality === 'ultra' ? 2 :
      exportConfig.quality === 'high' ? 1 :
      exportConfig.quality === 'medium' ? 0.5 : 0.25;
    
    const formatFactor = 
      exportConfig.format === 'mov' ? 1.2 :
      exportConfig.format === 'mp4' ? 1 :
      exportConfig.format === 'webm' ? 0.8 : 0.5;
    
    const compressionFactor = exportConfig.compressFile ? 0.7 : 1;
    
    // Base size in MB for a 30-second 720p video at 30fps
    const baseSize = 15;
    
    // Calculate the estimated size
    let estimatedSize = baseSize * resolutionFactor * qualityFactor * formatFactor * compressionFactor;
    
    // Adjust for audio
    if (exportConfig.includeAudio) {
      estimatedSize += 2;
    }
    
    // Format the result
    if (estimatedSize < 1) {
      return `${Math.round(estimatedSize * 1000)} KB`;
    } else if (estimatedSize > 1000) {
      return `${(estimatedSize / 1000).toFixed(1)} GB`;
    } else {
      return `${Math.round(estimatedSize)} MB`;
    }
  };

  // Get the status text and color for the current processing step
  const getProcessingStatusInfo = () => {
    switch (processStep) {
      case 'queued':
        return { text: 'Queued - Preparing for export...', color: 'blue' };
      case 'rendering':
        return { text: 'Rendering frames...', color: 'blue' };
      case 'encoding':
        return { text: 'Encoding video...', color: 'blue' };
      case 'finalizing':
        return { text: 'Finalizing export...', color: 'blue' };
      case 'completed':
        return { text: 'Export completed successfully!', color: 'green' };
      case 'error':
        return { text: 'Error during export process.', color: 'red' };
      default:
        return { text: 'Unknown status', color: 'gray' };
    }
  };

  const statusInfo = getProcessingStatusInfo();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="gray.800" maxWidth="900px">
        <ModalHeader>
          <Flex alignItems="center">
            <FaFileExport />
            <Text ml={2}>Export & Share</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Tabs index={activeTab} onChange={setActiveTab} colorScheme="brand" variant="enclosed">
            <TabList>
              <Tab>
                <Flex align="center">
                  <FaDownload size="14px" />
                  <Text ml={2}>Export Settings</Text>
                </Flex>
              </Tab>
              <Tab isDisabled={!exportUrl}>
                <Flex align="center">
                  <FaShareAlt size="14px" />
                  <Text ml={2}>Share</Text>
                </Flex>
              </Tab>
            </TabList>
            
            <TabPanels>
              {/* Export Settings Tab */}
              <TabPanel>
                <Stack spacing={6}>
                  {isProcessing ? (
                    <Box>
                      <Heading size="sm" mb={4}>Export Progress</Heading>
                      <Badge colorScheme={statusInfo.color} mb={2}>{statusInfo.text}</Badge>
                      <Progress 
                        value={progress} 
                        size="lg" 
                        colorScheme={
                          processStep === 'completed' ? 'green' :
                          processStep === 'error' ? 'red' : 'brand'
                        } 
                        hasStripe={processStep !== 'completed' && processStep !== 'error'}
                        isAnimated={processStep !== 'completed' && processStep !== 'error'}
                        borderRadius="md"
                        mb={4}
                      />
                      
                      {processStep === 'completed' && (
                        <VStack spacing={4} align="flex-start" mt={6}>
                          <Text fontSize="md">Your video has been successfully exported and is ready to be downloaded or shared.</Text>
                          <HStack>
                            <Button 
                              leftIcon={<FaDownload />} 
                              colorScheme="brand"
                              as="a"
                              href={exportUrl}
                              download={`AI-Video.${exportConfig.format}`}
                            >
                              Download Video
                            </Button>
                            <Button 
                              rightIcon={<FaChevronRight />} 
                              variant="outline" 
                              onClick={() => setActiveTab(1)}
                            >
                              Proceed to Sharing
                            </Button>
                          </HStack>
                        </VStack>
                      )}
                      
                      {processStep === 'error' && (
                        <VStack spacing={4} align="flex-start" mt={6}>
                          <Text fontSize="md" color="red.300">
                            An error occurred during the export process. Please try again with different settings or contact support if the issue persists.
                          </Text>
                          <Button 
                            leftIcon={<FaCog />} 
                            colorScheme="red" 
                            onClick={() => setIsProcessing(false)}
                          >
                            Return to Settings
                          </Button>
                        </VStack>
                      )}
                    </Box>
                  ) : (
                    <>
                      <Heading size="sm">Video Export Configuration</Heading>
                      <Text color="gray.400" fontSize="sm">
                        Configure the export settings for your video. Higher quality and resolution will result in larger file sizes.
                      </Text>
                      
                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                        <GridItem>
                          <FormControl>
                            <FormLabel>Format</FormLabel>
                            <Select
                              value={exportConfig.format}
                              onChange={(e) => handleExportConfigChange('format', e.target.value)}
                              bg="gray.700"
                            >
                              <option value="mp4">MP4 (H.264) - Most Compatible</option>
                              <option value="webm">WebM (VP9) - Web Optimized</option>
                              <option value="mov">MOV (ProRes) - High Quality</option>
                              <option value="gif">GIF - Animation</option>
                            </Select>
                          </FormControl>
                        </GridItem>
                        
                        <GridItem>
                          <FormControl>
                            <FormLabel>Resolution</FormLabel>
                            <Select
                              value={exportConfig.resolution}
                              onChange={(e) => handleExportConfigChange('resolution', e.target.value)}
                              bg="gray.700"
                            >
                              <option value="4k">4K (3840 x 2160)</option>
                              <option value="1080p">Full HD (1920 x 1080)</option>
                              <option value="720p">HD (1280 x 720)</option>
                              <option value="480p">SD (854 x 480)</option>
                            </Select>
                          </FormControl>
                        </GridItem>
                        
                        <GridItem>
                          <FormControl>
                            <FormLabel>Quality</FormLabel>
                            <Select
                              value={exportConfig.quality}
                              onChange={(e) => handleExportConfigChange('quality', e.target.value)}
                              bg="gray.700"
                            >
                              <option value="ultra">Ultra - Maximum Quality</option>
                              <option value="high">High - Recommended</option>
                              <option value="medium">Medium - Balanced</option>
                              <option value="low">Low - Smallest File Size</option>
                            </Select>
                          </FormControl>
                        </GridItem>
                        
                        <GridItem>
                          <FormControl>
                            <FormLabel>Frame Rate (FPS)</FormLabel>
                            <Flex align="center">
                              <Slider
                                min={15}
                                max={60}
                                step={5}
                                value={exportConfig.fps}
                                onChange={(val) => handleExportConfigChange('fps', val)}
                                flex="1"
                                mr={4}
                                colorScheme="brand"
                              >
                                <SliderTrack>
                                  <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb boxSize={6}>
                                  <Box color="brand.500" as={FaVideo} />
                                </SliderThumb>
                              </Slider>
                              <Text fontWeight="bold" width="40px">{exportConfig.fps}</Text>
                            </Flex>
                          </FormControl>
                        </GridItem>
                      </Grid>
                      
                      <Divider borderColor="gray.600" />
                      
                      <Heading size="sm" mb={3}>Additional Options</Heading>
                      
                      <Stack spacing={3}>
                        <FormControl display="flex" alignItems="center">
                          <Switch
                            id="include-audio"
                            isChecked={exportConfig.includeAudio}
                            onChange={(e) => handleExportConfigChange('includeAudio', e.target.checked)}
                            colorScheme="brand"
                            mr={3}
                          />
                          <FormLabel htmlFor="include-audio" mb={0}>Include audio track</FormLabel>
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <Switch
                            id="compress-file"
                            isChecked={exportConfig.compressFile}
                            onChange={(e) => handleExportConfigChange('compressFile', e.target.checked)}
                            colorScheme="brand"
                            mr={3}
                          />
                          <FormLabel htmlFor="compress-file" mb={0}>Compress file (smaller size)</FormLabel>
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <Switch
                            id="watermark"
                            isChecked={exportConfig.addWatermark}
                            onChange={(e) => handleExportConfigChange('addWatermark', e.target.checked)}
                            colorScheme="brand"
                            mr={3}
                          />
                          <FormLabel htmlFor="watermark" mb={0}>
                            Add AI Content Creator watermark
                            {!exportConfig.addWatermark && (
                              <Badge ml={2} colorScheme="yellow" fontSize="xs">PRO Feature</Badge>
                            )}
                          </FormLabel>
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <Switch
                            id="optimize-web"
                            isChecked={exportConfig.optimizeForWeb}
                            onChange={(e) => handleExportConfigChange('optimizeForWeb', e.target.checked)}
                            colorScheme="brand"
                            mr={3}
                          />
                          <FormLabel htmlFor="optimize-web" mb={0}>Optimize for web sharing</FormLabel>
                        </FormControl>
                      </Stack>
                      
                      <Divider borderColor="gray.600" />
                      
                      <HStack spacing={4} justify="space-between">
                        <VStack align="flex-start" spacing={1}>
                          <Text fontSize="sm">Estimated File Size: <strong>{calculateEstimatedFileSize()}</strong></Text>
                          <Text fontSize="sm" color="gray.400">
                            Video Duration: <strong>00:36</strong>
                          </Text>
                        </VStack>
                        
                        <Button
                          leftIcon={<FaDownload />}
                          colorScheme="brand"
                          size="lg"
                          onClick={startExport}
                        >
                          Export Video
                        </Button>
                      </HStack>
                    </>
                  )}
                </Stack>
              </TabPanel>
              
              {/* Share Tab */}
              <TabPanel>
                <Stack spacing={6}>
                  <Heading size="sm">Share Your Video</Heading>
                  <Text color="gray.400" fontSize="sm">
                    Choose a platform to share your exported video or get a direct link.
                  </Text>
                  
                  <Box bg="gray.700" p={4} borderRadius="md">
                    <FormControl mb={4}>
                      <FormLabel>Platform</FormLabel>
                      <Select
                        value={sharingConfig.platform}
                        onChange={(e) => handleSharingConfigChange('platform', e.target.value)}
                        bg="gray.600"
                      >
                        <option value="direct">Direct Link</option>
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="facebook">Facebook</option>
                        <option value="twitter">Twitter</option>
                        <option value="instagram">Instagram</option>
                        <option value="linkedin">LinkedIn</option>
                      </Select>
                    </FormControl>
                    
                    {sharingConfig.platform !== 'direct' && (
                      <>
                        <FormControl mb={4}>
                          <FormLabel>Title</FormLabel>
                          <Input
                            value={sharingConfig.title}
                            onChange={(e) => handleSharingConfigChange('title', e.target.value)}
                            placeholder="Enter a title for your video"
                            bg="gray.600"
                          />
                        </FormControl>
                        
                        <FormControl mb={4}>
                          <FormLabel>Description</FormLabel>
                          <Input
                            value={sharingConfig.description}
                            onChange={(e) => handleSharingConfigChange('description', e.target.value)}
                            placeholder="Enter a description for your video"
                            bg="gray.600"
                          />
                        </FormControl>
                        
                        <FormControl mb={4}>
                          <FormLabel>Visibility</FormLabel>
                          <Select
                            value={sharingConfig.visibility}
                            onChange={(e) => handleSharingConfigChange('visibility', e.target.value)}
                            bg="gray.600"
                          >
                            <option value="public">Public - Anyone can see</option>
                            <option value="unlisted">Unlisted - Only those with the link can see</option>
                            <option value="private">Private - Only you can see</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl mb={4}>
                          <FormLabel>Tags</FormLabel>
                          <HStack>
                            <InputGroup size="md">
                              <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="Add tags (press Enter to add)"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTag();
                                  }
                                }}
                                bg="gray.600"
                              />
                              <InputRightAddon
                                children="Add"
                                cursor="pointer"
                                onClick={addTag}
                                bg="brand.500"
                                color="white"
                              />
                            </InputGroup>
                          </HStack>
                          
                          <Flex mt={2} flexWrap="wrap" gap={2}>
                            {sharingConfig.tags.map((tag) => (
                              <Badge
                                key={tag}
                                colorScheme="brand"
                                borderRadius="full"
                                px={2}
                                py={1}
                                display="flex"
                                alignItems="center"
                              >
                                {tag}
                                <Box
                                  as="span"
                                  ml={1}
                                  cursor="pointer"
                                  onClick={() => removeTag(tag)}
                                >
                                  ×
                                </Box>
                              </Badge>
                            ))}
                          </Flex>
                        </FormControl>
                      </>
                    )}
                    
                    {sharingConfig.platform === 'direct' && (
                      <Box mt={4}>
                        <FormControl mb={4}>
                          <FormLabel>Direct Link</FormLabel>
                          <InputGroup>
                            <Input
                              value={exportUrl}
                              isReadOnly
                              bg="gray.600"
                            />
                            <InputRightAddon
                              children={
                                <Tooltip label={directLinkCopied ? "Copied!" : "Copy to clipboard"}>
                                  <IconButton
                                    aria-label="Copy link"
                                    icon={directLinkCopied ? <FaCheck /> : <FaCopy />}
                                    size="sm"
                                    onClick={copyDirectLink}
                                    colorScheme={directLinkCopied ? "green" : "gray"}
                                    variant="ghost"
                                  />
                                </Tooltip>
                              }
                              bg="gray.500"
                            />
                          </InputGroup>
                        </FormControl>
                        <Text fontSize="sm" color="gray.400">
                          Share this link directly with others to let them view or download your video.
                        </Text>
                      </Box>
                    )}
                  </Box>
                  
                  <Divider borderColor="gray.600" />
                  
                  {/* Social Platform Buttons */}
                  {sharingConfig.platform !== 'direct' ? (
                    <Button
                      leftIcon={
                        sharingConfig.platform === 'youtube' ? <FaYoutube /> :
                        sharingConfig.platform === 'vimeo' ? <FaVimeo /> :
                        sharingConfig.platform === 'facebook' ? <FaFacebook /> :
                        sharingConfig.platform === 'twitter' ? <FaTwitter /> :
                        sharingConfig.platform === 'instagram' ? <FaInstagram /> :
                        <FaLinkedin />
                      }
                      colorScheme={
                        sharingConfig.platform === 'youtube' ? 'red' :
                        sharingConfig.platform === 'vimeo' ? 'blue' :
                        sharingConfig.platform === 'facebook' ? 'facebook' :
                        sharingConfig.platform === 'twitter' ? 'twitter' :
                        sharingConfig.platform === 'instagram' ? 'pink' :
                        'linkedin'
                      }
                      onClick={shareVideo}
                      alignSelf="flex-end"
                      size="lg"
                    >
                      Share on {
                        sharingConfig.platform === 'youtube' ? 'YouTube' :
                        sharingConfig.platform === 'vimeo' ? 'Vimeo' :
                        sharingConfig.platform === 'facebook' ? 'Facebook' :
                        sharingConfig.platform === 'twitter' ? 'Twitter' :
                        sharingConfig.platform === 'instagram' ? 'Instagram' :
                        'LinkedIn'
                      }
                    </Button>
                  ) : (
                    <HStack spacing={3} mt={4} justify="flex-end">
                      <Button
                        leftIcon={<FaFacebook />}
                        colorScheme="facebook"
                        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(exportUrl)}`, '_blank')}
                      >
                        Facebook
                      </Button>
                      <Button
                        leftIcon={<FaTwitter />}
                        colorScheme="twitter"
                        onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(exportUrl)}&text=${encodeURIComponent('Check out my AI-generated video!')}`, '_blank')}
                      >
                        Twitter
                      </Button>
                      <Button
                        leftIcon={<FaLinkedin />}
                        colorScheme="linkedin"
                        onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(exportUrl)}`, '_blank')}
                      >
                        LinkedIn
                      </Button>
                    </HStack>
                  )}
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExportDialog;
