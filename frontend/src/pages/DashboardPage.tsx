import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Image,
  Text,
  Stack,
  HStack,
  Badge,
  useColorModeValue,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  SimpleGrid,
  Skeleton,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FaPlus, FaEllipsisV, FaSearch, FaFilter, FaChevronRight } from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';

// Placeholder for actual project data slice
// import { fetchProjects } from '../features/projects/projectSlice';

// Temp type for project
interface Project {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  status: 'draft' | 'in-progress' | 'completed';
  updatedAt: string;
}

const DashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  useEffect(() => {
    // Simulate loading projects
    const loadProjects = async () => {
      try {
        // In a real app, we would dispatch an action like:
        // dispatch(fetchProjects());
        
        // Simulate API call with timeout
        setTimeout(() => {
          // Mock data
          const mockProjects: Project[] = [
            {
              id: '1',
              title: 'Product Explainer Video',
              description: 'A short explainer video for our SaaS product',
              thumbnailUrl: '',
              status: 'completed',
              updatedAt: '2025-02-15T10:30:00Z',
            },
            {
              id: '2',
              title: 'Social Media Promo',
              description: 'Short promotional video for Instagram',
              thumbnailUrl: '',
              status: 'in-progress',
              updatedAt: '2025-03-01T14:22:00Z',
            },
            {
              id: '3',
              title: 'Company About Us',
              description: 'Company introduction video for the website',
              thumbnailUrl: '',
              status: 'draft',
              updatedAt: '2025-03-08T09:15:00Z',
            },
          ];
          
          setProjects(mockProjects);
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Failed to load projects:', error);
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, [dispatch]);
  
  // Filter projects based on status and search term
  const filteredProjects = projects.filter((project) => {
    const matchesFilter = filter === 'all' || project.status === filter;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'gray';
      case 'in-progress':
        return 'blue';
      case 'completed':
        return 'green';
      default:
        return 'gray';
    }
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        {/* Dashboard Header */}
        <Flex justifyContent="space-between" alignItems="center">
          <Box>
            <Heading as="h1" size="xl" mb={2}>
              My Projects
            </Heading>
            <Text color="gray.400">
              Welcome back, {user?.displayName || 'Creator'}!
            </Text>
          </Box>
          <Button
            as={RouterLink}
            to="/project/new"
            colorScheme="brand"
            leftIcon={<FaPlus />}
            size="md"
          >
            New Project
          </Button>
        </Flex>
        
        {/* Search and Filters */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          gap={4}
          justifyContent="space-between"
          alignItems={{ base: 'stretch', md: 'center' }}
        >
          <InputGroup maxW={{ base: '100%', md: '400px' }}>
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search projects" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="gray.700"
            />
          </InputGroup>
          
          <HStack>
            <Box>
              <Select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                icon={<FaFilter />}
                bg="gray.700"
              >
                <option value="all">All Projects</option>
                <option value="draft">Drafts</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
            </Box>
          </HStack>
        </Flex>
        
        {/* Projects Grid */}
        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
            {[...Array(3)].map((_, index) => (
              <Card 
                key={index} 
                bg="gray.800" 
                borderRadius="lg" 
                overflow="hidden"
                variant="elevated"
                height="100%"
              >
                <Skeleton height="150px" />
                <CardBody>
                  <Skeleton height="20px" width="80%" my={2} />
                  <Skeleton height="15px" my={2} />
                  <Skeleton height="15px" width="60%" my={2} />
                </CardBody>
                <CardFooter>
                  <Skeleton height="30px" width="120px" />
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        ) : filteredProjects.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
            {filteredProjects.map((project) => (
              <Card 
                key={project.id} 
                bg="gray.800" 
                borderRadius="lg" 
                overflow="hidden"
                variant="elevated"
                height="100%"
                _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.3s ease' }}
              >
                <Box height="150px" bg="gray.700" position="relative">
                  {project.thumbnailUrl ? (
                    <Image 
                      src={project.thumbnailUrl} 
                      alt={project.title} 
                      objectFit="cover" 
                      h="100%" 
                      w="100%" 
                    />
                  ) : (
                    <Flex 
                      h="100%" 
                      alignItems="center" 
                      justifyContent="center" 
                      color="gray.500"
                      fontSize="sm"
                    >
                      [Project Thumbnail]
                    </Flex>
                  )}
                  <Badge 
                    position="absolute" 
                    top={2} 
                    right={2}
                    colorScheme={getStatusColor(project.status)}
                    borderRadius="full"
                    px={2}
                    py={1}
                    textTransform="capitalize"
                    fontSize="xs"
                  >
                    {project.status.replace('-', ' ')}
                  </Badge>
                </Box>
                
                <CardBody>
                  <Stack spacing={3}>
                    <Heading as="h3" size="md">{project.title}</Heading>
                    <Text color="gray.400" noOfLines={2}>{project.description}</Text>
                    <Text fontSize="sm" color="gray.500">
                      Updated: {formatDate(project.updatedAt)}
                    </Text>
                  </Stack>
                </CardBody>
                
                <Divider borderColor="gray.700" />
                
                <CardFooter>
                  <Flex justifyContent="space-between" alignItems="center" width="100%">
                    <Button
                      as={RouterLink}
                      to={`/project/${project.id}`}
                      rightIcon={<FaChevronRight />}
                      variant="ghost"
                      size="sm"
                    >
                      Open Project
                    </Button>
                    
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FaEllipsisV />}
                        variant="ghost"
                        aria-label="Options"
                        size="sm"
                      />
                      <MenuList bg="gray.800" borderColor="gray.700">
                        <MenuItem 
                          as={RouterLink} 
                          to={`/project/${project.id}`}
                          bg="gray.800"
                          _hover={{ bg: 'gray.700' }}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem 
                          as={RouterLink} 
                          to={`/project/${project.id}/duplicate`}
                          bg="gray.800"
                          _hover={{ bg: 'gray.700' }}
                        >
                          Duplicate
                        </MenuItem>
                        <MenuItem 
                          bg="gray.800"
                          _hover={{ bg: 'gray.700' }}
                          color="red.400"
                          onClick={() => {
                            // In a real app, we would dispatch an action to delete the project
                            console.log('Delete project:', project.id);
                          }}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Box 
            p={8} 
            textAlign="center" 
            bg="gray.800" 
            borderRadius="lg"
          >
            <Heading size="md" mb={4}>No projects found</Heading>
            <Text color="gray.400" mb={6}>
              {searchTerm || filter !== 'all' 
                ? "No projects match your search/filter criteria." 
                : "You haven't created any projects yet."}
            </Text>
            <Button
              as={RouterLink}
              to="/project/new"
              colorScheme="brand"
              leftIcon={<FaPlus />}
            >
              Create Your First Project
            </Button>
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default DashboardPage;