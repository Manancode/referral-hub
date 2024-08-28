import {
    HoverCard,
    Group,
    Button,
    UnstyledButton,
    Text,
    SimpleGrid,
    ThemeIcon,
    Anchor,
    Divider,
    Center,
    Box,
    Burger,
    Drawer,
    Collapse,
    ScrollArea,
    rem,
    useMantineTheme,
  } from '@mantine/core';
  import { useDisclosure } from '@mantine/hooks';
  import {
    IconNotification,
    IconChevronDown,
    IconDatabaseImport,
    IconReportAnalytics,
    IconSettingsStar,
    IconBrandMixpanel,
    IconUsersGroup,
  } from '@tabler/icons-react';
  import classes from './HeaderMegaMenu.module.css';
import Link from 'next/link';
  const mockdata = [
    {
      icon:IconDatabaseImport,
      title: 'Data Integration',
      description: 'Seamless integration with existing databases and APIs',
    },
    {
      icon: IconReportAnalytics,
      title: 'Customer Metrics',
      description: 'In-depth metrics on financial performance, engagement, support interactions, and behavioral patterns',
    },
    {
      icon: IconSettingsStar,
      title: 'Customizable Rating System',
      description: 'Flexible rating categories with adjustable weightage',
    },
    {
      icon: IconBrandMixpanel,
      title: 'Analytics',
      description: 'Detailed analytics and visual reports on customer scores and trends',
    },
    {
      icon: IconUsersGroup,
      title: 'Segmentation',
      description: 'Categorize and segment customers based on composite scores and metrics',
    },
    {
      icon: IconNotification,
      title: 'Notifications',
      description: 'Instant alerts for important changes or updates related to customer metrics and ratings',
    },
  ];
  
  export function HeaderMegaMenu() {
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
    const theme = useMantineTheme();
  
    const links = mockdata.map((item) => (
      <UnstyledButton className={classes.subLink} key={item.title}>
        <Group wrap="nowrap" align="flex-start">
          <ThemeIcon size={34} variant="default" radius="md">
            <item.icon style={{ width: rem(22), height: rem(22) }} color={theme.colors.blue[6]} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={500}>
              {item.title}
            </Text>
            <Text size="xs" c="dimmed">
              {item.description}
            </Text>
          </div>
        </Group>
      </UnstyledButton>
    ));
  
    return (
      <Box pb={120}>
        <header className={classes.header}>
          <Group justify="space-between" h="100%">
            <div><Link href={"/"}>
                    <h1 className='font-bold text-2xl'>Rateyour<span className="text-primary">customer</span></h1>
                </Link></div>
  
            <Group h="100%" gap={0} visibleFrom="sm">
              <a href="#" className={classes.link}>
                FAQ
              </a>
              <HoverCard width={600} position="bottom" radius="md" shadow="md" withinPortal>
                <HoverCard.Target>
                  <a href="#" className={classes.link}>
                    <Center inline>
                      <Box component="span" mr={5}>
                        Features
                      </Box>
                      <IconChevronDown
                       style={{ width: rem(16), height: rem(16) }}
                        color={theme.colors.blue[6]}
                      />
                    </Center>
                  </a>
                </HoverCard.Target>
  
                <HoverCard.Dropdown style={{ overflow: 'hidden' }}>
                  <Group justify="space-between" px="md">
                    <Text fw={500}>Features</Text>
                    <Anchor href="#" fz="xs">
                      View more
                    </Anchor>
                  </Group>
  
                  <Divider my="sm" />
  
                  <SimpleGrid cols={2} spacing={0}>
                    {links}
                  </SimpleGrid>
  
                  <div className={classes.dropdownFooter}>
                    <Group justify="space-between">
                      <div>
                        <Text fw={500} fz="sm">
                          Get started
                        </Text>
                        <Text size="xs" c="dimmed">
                        Visit our docs to get started.
                        </Text>
                      </div>
                      <Button variant="default">Get started</Button>
                    </Group>
                  </div>
                </HoverCard.Dropdown>
              </HoverCard>
              <a href="/dashboard" className={classes.link}>
                Pricing
              </a>
              <a href="#" className={classes.link}>
                Documentation
              </a>
            </Group>
  
            <Group visibleFrom="sm">
            <Button variant="default"> <Link href='https://commonwaitlist.vercel.app/'>Login</Link></Button>
            <Button> <Link href='https://commonwaitlist.vercel.app/'>Signup</Link></Button>
            
              {/* <LoginLink><Button variant="default">Log in</Button></LoginLink>
              <RegisterLink><Button>Sign up</Button></RegisterLink> */}
            </Group>
  
            <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
          </Group>
        </header>
  
        <Drawer
          opened={drawerOpened}
          onClose={closeDrawer}
          size="100%"
          padding="md"
          title="Navigation"
          hiddenFrom="sm"
          zIndex={1000000}
        >
          <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
            <Divider my="sm" />
  
            <a href="#" className={classes.link}>
              FAQ
            </a>
            <UnstyledButton className={classes.link} onClick={toggleLinks}>
              <Center inline>
                <Box component="span" mr={5}>
                  Features
                </Box>
                <IconChevronDown
                  style={{ width: rem(16), height: rem(16) }}
                  color={theme.colors.blue[6]}
                />
              </Center>
            </UnstyledButton>
            <Collapse in={linksOpened}>{links}</Collapse>
            <a href="#" className={classes.link}>
              Pricing
            </a>
            <a href="#" className={classes.link}>
              Documentation
            </a>
  
            <Divider my="sm" />
  
            <Group justify="center" grow pb="xl" px="md">
              <Button variant="default">Log in</Button>
              <Button>Sign up</Button>
            </Group>
          </ScrollArea>
        </Drawer>
      </Box>
    );
  }