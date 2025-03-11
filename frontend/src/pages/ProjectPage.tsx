import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  IconButton,
  useToast,
  Spinner,
  Center,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { FaArrowLeft, FaSave, FaPlay, FaDownload, FaShare, FaHome } from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';

// Import our Style Selection Tab component
import StyleSelectionTab from '../components/style/StyleSelectionTab';

interface ProjectData {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  aspectRatio?: string;
  styleData?: {
    srefCode?: string;
    keywords?: string[];
    colorPalette?: string[];
  };
  // Additional fields will be included based on project stage
}

const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNewProject = id === 'new';
  const navigate = useNavigate();
  const toast = useToast();
  const dispatch = useAppDispatch();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [styleData, setStyleData] = useState<ProjectData['styleData']>({});
  
  useEffect(() => {
    const loadProject = async () => {
      if (isNewProject) {
        // Initialize new project
        setProject({
          id: 'temp-id',
          title: 'Untitled Project',
          description: '',
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          aspectRatio: '16:9',
          styleData: {
            keywords: [],
            colorPalette: [],
          },
        });
        setTitle('Untitled Project');
        setDescription('');
        setStyleData({
          keywords: [],
          colorPalette: [],
        });
        setIsLoading(false);
        return;
      }
      
      try {
        // In a real app, we would dispatch an action like:
        // const projectData = await dispatch(fetchProject(id)).unwrap();
        
        // Simulate API call with timeout
        setTimeout(() => {
          // Mock data
          const mockProject: ProjectData = {
            id: id || 'temp-id',
            title: 'Sample Project',
            description: 'This is a sample project description for demonstration purposes.',
            status: 'in-progress',
            createdAt: '2025-03-01T12:00:00Z',
            updatedAt: '2025-03-10T14:30:00Z',
            aspectRatio: '16:9',
            styleData: {
              srefCode: 'minimalist-01',
              keywords: ['Clean', 'Modern', 'Simple'],
              colorPalette: ['#FFFFFF', '#000000', '#1f8de6'],
            },
          };
          
          setProject(mockProject);
          setTitle(mockProject.title);
          setDescription(mockProject.description);
          setStyleData(mockProject.styleData || {});
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to load project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
      }
    };
    
    loadProject();
  }, [id, isNewProject, dispatch, toast]);
  
  const handleSaveProject = async () => {
    try {
      setIsLoading(true);
      
      const updatedProject = {
        ...project,
        title,
        description,
        styleData,
        updatedAt: new Date().toISOString(),
      };
      
      // In a real app, we would dispatch an action like:
      // if (isNewProject) {
      //   const newProject = await dispatch(createProject(updatedProject)).unwrap();
      //   navigate(`/project/${newProject.id}`);
      // } else {
      //   await dispatch(updateProject({ id, ...updatedProject })).unwrap();
      // }
      
      // Simulate API call with timeout
      setTimeout(() => {
        setProject(updatedProject as ProjectData);
        setIsLoading(false);
        
        if (isNewProject) {
          // Navigate to a fake ID for demo purposes
          navigate('/project/new-project-123');
        }
        
        toast({
          title: 'Success',
          description: `Project ${isNewProject ? 'created' : 'updated'} successfully.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to save project:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isNewProject ? 'create' : 'update'} project. Please try again.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };
  
  const handleStyleDataChange = (newStyleData: ProjectData['styleData']) => {
    setStyleData(newStyleData);
  };
  
  const handleTabChange = (index: number) => {
    // Save current progress before changing tabs
    if (project && (title !== project.title || description !== project.description)) {
      onOpen(); // Open confirmation modal
      return;
    }
    
    setActiveTab(index);
  };
  
  const confirmTabChange = (index: number) => {
    onClose();
    setActiveTab(index);
  };
  
  // Render loading state
  if (isLoading && !isNewProject) {
    return (
      <Center h="80vh">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="brand.500"
          size="xl"
        />
      </Center>
    );
  }
  
  return (
    <Container maxW="container.xl" py={6}>
      {/* Breadcrumb navigation */}
      <Breadcrumb mb={6} color="gray.400">
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/" color="gray.400">
            <FaHome />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/dashboard" color="gray.400">
            Projects
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink color="gray.200">
            {isNewProject ? 'New Project' : title}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      {/* Project header */}
      <Flex 
        justifyContent="space-between" 
        alignItems="center" 
        mb={8}
        flexDir={{ base: 'column', md: 'row' }}
        gap={4}
      >
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            {isNewProject ? 'Create New Project' : title}
          </Heading>
          {!isNewProject && (
            <Text color="gray.400">
              Status: <Text as="span" fontWeight="bold" color={project?.status === 'completed' ? 'green.400' : 'blue.400'}>
                {project?.status.replace('-', ' ')}
              </Text>
            </Text>
          )}
        </Box>
        
        <HStack spacing={4}>
          <Button
            leftIcon={<FaArrowLeft />}
            onClick={() => navigate('/dashboard')}
            variant="ghost"
          >
            Back
          </Button>
          
          <Button
            leftIcon={<FaSave />}
            colorScheme="brand"
            onClick={handleSaveProject}
            isLoading={isLoading}
          >
            {isNewProject ? 'Create Project' : 'Save Changes'}
          </Button>
          
          {!isNewProject && (
            <>
              <IconButton
                icon={<FaPlay />}
                aria-label="Preview"
                colorScheme="green"
                isDisabled={project?.status !== 'completed'}
                title={project?.status !== 'completed' ? 'Available when project is completed' : 'Preview'}
              />
              
              <IconButton
                icon={<FaDownload />}
                aria-label="Export"
                colorScheme="blue"
                isDisabled={project?.status !== 'completed'}
                title={project?.status !== 'completed' ? 'Available when project is completed' : 'Export'}
              />
              
              <IconButton
                icon={<FaShare />}
                aria-label="Share"
                colorScheme="purple"
                isDisabled={project?.status !== 'completed'}
                title={project?.status !== 'completed' ? 'Available when project is completed' : 'Share'}
              />
            </>
          )}
        </HStack>
      </Flex>
      
      {/* Project workflow tabs */}
      <Tabs 
        index={activeTab} 
        onChange={handleTabChange} 
        colorScheme="brand"
        variant="enclosed"
        isLazy
      >
        <TabList>
          <Tab>Project Info</Tab>
          <Tab isDisabled={isNewProject}>Style Selection</Tab>
          <Tab isDisabled={isNewProject}>Storytelling</Tab>
          <Tab isDisabled={isNewProject}>Storyboard</Tab>
          <Tab isDisabled={isNewProject}>Video & Audio</Tab>
        </TabList>
        
        <TabPanels>
          {/* Project Info Tab */}
          <TabPanel>
            <Box bg="gray.800" p={6} borderRadius="md">
              <FormControl mb={4}>
                <FormLabel>Project Title</FormLabel>
                <Input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title"
                  bg="gray.700"
                />
              </FormControl>
              
              <FormControl mb={4}>
                <FormLabel>Description</FormLabel>
                <Textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={5}
                  bg="gray.700"
                />
              </FormControl>
              
              {!isNewProject && (
                <Box mt={8}>
                  <Text fontSize="sm" color="gray.400">
                    Created: {new Date(project?.createdAt || '').toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Last Updated: {new Date(project?.updatedAt || '').toLocaleString()}
                  </Text>
                </Box>
              )}
            </Box>
          </TabPanel>
          
          {/* Style Selection Tab */}
          <TabPanel>
            <Box bg="gray.800" p={6} borderRadius="md">
              {project && !isNewProject ? (
                <StyleSelectionTab 
                  projectId={project.id}
                  initialStyleData={project.styleData}
                  onStyleDataChange={handleStyleDataChange}
                />
              ) : (
                <Text>Please create and save the project first to access the Style Selection module.</Text>
              )}
            </Box>
          </TabPanel>
          
          {/* Storytelling Tab */}
          <TabPanel>
            <Box bg="gray.800" p={6} borderRadius="md">
              <Heading size="md" mb={4}>Storytelling</Heading>
              <Text>
                This section will contain the Storytelling module where users can define their concept
                and generate a screenplay using AI assistance.
              </Text>
            </Box>
          </TabPanel>
          
          {/* Storyboard Tab */}
          <TabPanel>
            <Box bg="gray.800" p={6} borderRadius="md">
              <Heading size="md" mb={4}>Storyboard</Heading>
              <Text>
                This section will contain the Storyboard module where users can visualize their screenplay
                as a sequence of images generated by AI.
              </Text>
            </Box>
          </TabPanel>
          
          {/* Video & Audio Tab */}
          <TabPanel>
            <Box bg="gray.800" p={6} borderRadius="md">
              <Heading size="md" mb={4}>Video & Audio</Heading>
              <Text>
                This section will contain the Video & Audio module where users can generate the final video
                with animation, transitions, music, and voice-over.
              </Text>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Unsaved changes confirmation modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader>Unsaved Changes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              You have unsaved changes. Do you want to save them before switching tabs?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => {
                onClose();
                setTitle(project?.title || '');
                setDescription(project?.description || '');
                setActiveTab(activeTab);
              }}
            >
              Discard Changes
            </Button>
            <Button
              variant="ghost"
              mr={3}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="brand"
              onClick={() => {
                handleSaveProject();
                onClose();
              }}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ProjectPage;