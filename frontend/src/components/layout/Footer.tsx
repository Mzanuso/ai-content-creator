import React from 'react';
import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  useColorModeValue,
  Flex,
  Icon,
  VisuallyHidden,
} from '@chakra-ui/react';
import { FaTwitter, FaYoutube, FaInstagram } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

const ListHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};

const SocialButton = ({
  children,
  label,
  href,
}: {
  children: React.ReactNode;
  label: string;
  href: string;
}) => {
  return (
    <Link
      bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      rounded={'full'}
      w={8}
      h={8}
      cursor={'pointer'}
      as={'a'}
      href={href}
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      _hover={{
        bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
      }}
      isExternal
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </Link>
  );
};

const Footer: React.FC = () => {
  return (
    <Box
      bg={useColorModeValue('gray.800', 'gray.900')}
      color={useColorModeValue('gray.200', 'gray.200')}
    >
      <Container as={Stack} maxW={'6xl'} py={10}>
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Box>
              <Text fontSize={'xl'} fontWeight="bold" color={'brand.500'}>
                AI Content Creator
              </Text>
            </Box>
            <Text fontSize={'sm'}>
              Create beautiful video content with the power of AI.
              <br />© {new Date().getFullYear()} AI Content Creator. All rights reserved.
            </Text>
            <Stack direction={'row'} spacing={6}>
              <SocialButton label={'Twitter'} href={'#'}>
                <FaTwitter />
              </SocialButton>
              <SocialButton label={'YouTube'} href={'#'}>
                <FaYoutube />
              </SocialButton>
              <SocialButton label={'Instagram'} href={'#'}>
                <FaInstagram />
              </SocialButton>
            </Stack>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Product</ListHeader>
            <Link as={RouterLink} to={'/features'}>Features</Link>
            <Link as={RouterLink} to={'/pricing'}>Pricing</Link>
            <Link as={RouterLink} to={'/gallery'}>Gallery</Link>
            <Link as={RouterLink} to={'/tutorials'}>Tutorials</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Company</ListHeader>
            <Link as={RouterLink} to={'/about'}>About Us</Link>
            <Link as={RouterLink} to={'/contact'}>Contact Us</Link>
            <Link as={RouterLink} to={'/blog'}>Blog</Link>
            <Link as={RouterLink} to={'/careers'}>Careers</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Support</ListHeader>
            <Link as={RouterLink} to={'/help'}>Help Center</Link>
            <Link as={RouterLink} to={'/terms'}>Terms of Service</Link>
            <Link as={RouterLink} to={'/privacy'}>Privacy Policy</Link>
            <Link as={RouterLink} to={'/refunds'}>Refund Policy</Link>
          </Stack>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Footer;