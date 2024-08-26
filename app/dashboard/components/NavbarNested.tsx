"use client";

import { Group, Code, ScrollArea, rem } from '@mantine/core';
import { UserButton } from './UserButton';
import { LinksGroup } from './NavbarLinksGroup';
import { Logo } from './Logo';
import classes from './NavbarNested.module.css';

const mockdata = [
  { label: 'Dashboard', icon: 'IconGauge', link: '/dashboard' },
  {
    label: 'Market news',
    icon: 'IconNotes',
    initiallyOpened: true,
    links: [
      { label: 'Overview', link: '/dashboard/market-news/overview' },
      { label: 'Forecasts', link: '/dashboard/market-news/forecasts' },
      { label: 'Outlook', link: '/dashboard/market-news/outlook' },
      { label: 'Real time', link: '/dashboard/market-news/real-time' },
    ],
  },
  {
    label: 'Releases',
    icon: 'IconCalendarStats',
    links: [
      { label: 'Upcoming releases', link: '/dashboard/releases/upcoming' },
      { label: 'Previous releases', link: '/dashboard/releases/previous' },
      { label: 'Releases schedule', link: '/dashboard/releases/schedule' },
    ],
  },
  { label: 'Analytics', icon: 'IconPresentationAnalytics', link: '/dashboard/analytics' },
  { label: 'Contracts', icon: 'IconFileAnalytics', link: '/dashboard/contracts' },
  { label: 'Settings', icon: 'IconAdjustments', link: '/dashboard/settings' },
  {
    label: 'Security',
    icon: 'IconLock',
    links: [
      { label: 'Enable 2FA', link: '/dashboard/security/enable-2fa' },
      { label: 'Change password', link: '/dashboard/security/change-password' },
      { label: 'Recovery codes', link: '/dashboard/security/recovery-codes' },
    ],
  },
];

export function NavbarNested() {
  const links = mockdata.map((item) => <LinksGroup {...item} key={item.label} />);

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between">
          <Logo style={{ width: rem(120) }} />
          <Code fw={700}>v3.1.2</Code>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserButton />
      </div>
    </nav>
  );
}
