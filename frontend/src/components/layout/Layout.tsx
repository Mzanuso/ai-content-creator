import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';

import Navbar from './Navbar';
import Footer from './Footer';
import { useAppSelector } from '../../hooks/reduxHooks';

const Layout: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Flex direction="column" minH="100vh">
      <Navbar />
      <Box as="main" flex="1" py={8}>
        <Outlet />
      </Box>
      <Footer />
    </Flex>
  );
};

export default Layout;