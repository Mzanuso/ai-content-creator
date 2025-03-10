import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  Stack,
  Container,
  SimpleGrid,
  Icon,
  Flex,
  Image,
  useColorModeValue
} from '@chakra-ui/react';
import { FaVideo, FaPalette, FaMagic, FaRobot } from 'react-icons/fa';
import { useAppSelector } from '../hooks/reduxHooks';

// Feature component for the homepage
interface FeatureProps {
  title: string;
  text: string;
  icon: React.ReactElement;
}

const Feature = ({ title, text, icon }: FeatureProps) => {
  return (
    <Stack align={'center'} textAlign={'center'}>
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        color={'white'}
        rounded={'full'}
        bg={'brand.500'}
        mb={4}
      >
        {icon}
      </Flex>
      <Heading fontSize={'xl'}>{title}</Heading>
      <Text color={'gray.400'}>{text}</Text>
    </Stack>
  );
};

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAppSelector(state => state.auth);
  
  return (
    <Box>
      {/* Hero Section */}
      <Container maxW={'7xl'} py={20}>
        <Stack
          align={'center'}
          spacing={{ base: 8, md: 10 }}
          py={{ base: 20, md: 28 }}
          direction={{ base: 'column', md: 'row' }}
        >
          <Stack flex={1} spacing={{ base: 5, md: 10 }}>
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: '3xl', sm: '4xl', lg: '6xl' }}
            >
              <Text
                as={'span'}
                position={'relative'}
                color={'white'}
              >
                Create stunning videos
              </Text>
              <br />
              <Text as={'span'} color={'brand.500'}>
                powered by AI
              </Text>
            </Heading>
            <Text color={'gray.400'}>
              AI Content Creator empowers you to produce high-quality video content in minutes, not days.
              Our AI-driven platform handles the creative heavy lifting, from script writing to final production,
              guiding you through a streamlined workflow.
            </Text>
            <Stack
              spacing={{ base: 4, sm: 6 }}
              direction={{ base: 'column', sm: 'row' }}
            >
              <Button
                as={RouterLink}
                to={isAuthenticated ? '/dashboard' : '/auth?mode=register'}
                rounded={'full'}
                size={'lg'}
                fontWeight={'normal'}
                px={6}
                colorScheme={'brand'}
                bg={'brand.500'}
                _hover={{ bg: 'brand.600' }}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              </Button>
              <Button
                as={RouterLink}
                to={'/gallery'}
                rounded={'full'}
                size={'lg'}
                fontWeight={'normal'}
                px={6}
                leftIcon={<FaVideo />}
              >
                See Examples
              </Button>
            </Stack>
          </Stack>
          <Flex
            flex={1}
            justify={'center'}
            align={'center'}
            position={'relative'}
            w={'full'}
          >
            <Box
              position={'relative'}
              height={'300px'}
              rounded={'2xl'}
              boxShadow={'2xl'}
              width={'full'}
              overflow={'hidden'}
              bg={'gray.700'}
            >
              {/* Placeholder for a demo video or animation */}
              <Text
                fontSize={'lg'}
                color={'white'}
                position={'absolute'}
                top={'50%'}
                left={'50%'}
                transform={'translate(-50%, -50%)'}
              >
                [Demo Video]
              </Text>
            </Box>
          </Flex>
        </Stack>
      </Container>

      {/* Features Section */}
      <Box id="features" py={20} bg={useColorModeValue('gray.800', 'gray.900')}>
        <Container maxW={'7xl'}>
          <Heading
            textAlign={'center'}
            fontSize={'4xl'}
            py={10}
            fontWeight={'bold'}
            color={'white'}
          >
            Key Features
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={10}>
            <Feature
              icon={<Icon as={FaPalette} w={10} h={10} />}
              title={'Style Selection'}
              text={'Choose from a variety of visual styles or customize your own with our intuitive interface.'}
            />
            <Feature
              icon={<Icon as={FaMagic} w={10} h={10} />}
              title={'AI Storytelling'}
              text={'Our AI writer helps you craft compelling narratives tailored to your message and audience.'}
            />
            <Feature
              icon={<Icon as={FaRobot} w={10} h={10} />}
              title={'AI Director'}
              text={'Transform your script into a professional storyboard with our AI director assistant.'}
            />
            <Feature
              icon={<Icon as={FaVideo} w={10} h={10} />}
              title={'Video Production'}
              text={'Generate production-ready videos with AI animations, transitions, and audio.'}
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box py={20}>
        <Container maxW={'3xl'}>
          <Stack
            as={Box}
            textAlign={'center'}
            spacing={{ base: 8, md: 14 }}
            py={{ base: 10, md: 16 }}
          >
            <Heading
              fontWeight={600}
              fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
              lineHeight={'110%'}
              color={'white'}
            >
              Ready to <br />
              <Text as={'span'} color={'brand.500'}>
                transform your content?
              </Text>
            </Heading>
            <Text color={'gray.400'}>
              Join thousands of creators, marketers, and businesses who are
              revolutionizing their video content strategy with AI.
            </Text>
            <Stack
              direction={'column'}
              spacing={3}
              align={'center'}
              alignSelf={'center'}
              position={'relative'}
            >
              <Button
                as={RouterLink}
                to={isAuthenticated ? '/project/new' : '/auth?mode=register'}
                colorScheme={'brand'}
                bg={'brand.500'}
                rounded={'full'}
                px={6}
                _hover={{
                  bg: 'brand.600',
                }}
                size={'lg'}
              >
                {isAuthenticated ? 'Create New Project' : 'Sign Up Free'}
              </Button>
              <Text color={'gray.500'} fontSize={'sm'}>
                No credit card required for basic plan
              </Text>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;