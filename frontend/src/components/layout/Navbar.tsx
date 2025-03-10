import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { logout } from '../../features/auth/authSlice';

const Navbar: React.FC = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <Box>
      <Flex
        bg={useColorModeValue('gray.800', 'gray.900')}
        color={useColorModeValue('white', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.700', 'gray.700')}
        align={'center'}>
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}>
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            as={RouterLink}
            to="/"
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            fontWeight="bold"
            fontSize="xl"
            color={useColorModeValue('brand.500', 'brand.300')}>
            AI Content Creator
          </Text>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}>
          {isAuthenticated ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}>
                <Avatar
                  size={'sm'}
                  name={user?.displayName || 'User'}
                  src={user?.photoURL || undefined}
                />
              </MenuButton>
              <MenuList bg="gray.800" borderColor="gray.700">
                <MenuItem as={RouterLink} to="/dashboard" bg="gray.800" _hover={{ bg: 'gray.700' }}>
                  Dashboard
                </MenuItem>
                <MenuItem as={RouterLink} to="/profile" bg="gray.800" _hover={{ bg: 'gray.700' }}>
                  Profile
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout} bg="gray.800" _hover={{ bg: 'gray.700' }}>
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <>
              <Button
                as={RouterLink}
                fontSize={'sm'}
                fontWeight={400}
                variant={'ghost'}
                to={'/auth?mode=login'}>
                Sign In
              </Button>
              <Button
                as={RouterLink}
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'brand.500'}
                to={'/auth?mode=register'}
                _hover={{
                  bg: 'brand.600',
                }}>
                Sign Up
              </Button>
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
};

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.200', 'gray.200');
  const linkHoverColor = useColorModeValue('white', 'white');
  const popoverContentBgColor = useColorModeValue('gray.800', 'gray.800');
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.filter(item => !item.requiresAuth || isAuthenticated).map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link
                as={RouterLink}
                p={2}
                to={navItem.href ?? '#'}
                fontSize={'sm'}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}>
                {navItem.label}
                {navItem.children && (
                  <Icon
                    as={ChevronDownIcon}
                    transition={'all .25s ease-in-out'}
                    w={6}
                    h={6}
                  />
                )}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}>
                <Stack>
                  {navItem.children
                    .filter(child => !child.requiresAuth || isAuthenticated)
                    .map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Link
      as={RouterLink}
      to={href ?? '#'}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('gray.700', 'gray.700') }}>
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'brand.400' }}
            fontWeight={500}>
            {label}
          </Text>
          <Text fontSize={'sm'} color="gray.400">{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}>
          <Icon color={'brand.400'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Stack
      bg={useColorModeValue('gray.800', 'gray.800')}
      p={4}
      display={{ md: 'none' }}>
      {NAV_ITEMS.filter(item => !item.requiresAuth || isAuthenticated).map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={RouterLink}
        to={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}>
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.200', 'gray.200')}>
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.700', 'gray.700')}
          align={'start'}>
          {children &&
            children
              .filter(child => !child.requiresAuth || isAuthenticated)
              .map((child) => (
              <Link
                key={child.label}
                py={2}
                as={RouterLink}
                to={child.href ?? "#"}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
  requiresAuth?: boolean;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Features',
    href: '/#features',
  },
  {
    label: 'Gallery',
    href: '/gallery',
  },
  {
    label: 'Pricing',
    href: '/pricing',
  },
  {
    label: 'Projects',
    requiresAuth: true,
    children: [
      {
        label: 'Dashboard',
        subLabel: 'Manage your projects',
        href: '/dashboard',
        requiresAuth: true,
      },
      {
        label: 'Create New',
        subLabel: 'Start a new project',
        href: '/project/new',
        requiresAuth: true,
      },
    ],
  },
];

export default Navbar;