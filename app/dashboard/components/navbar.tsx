import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@mantine/core'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@radix-ui/react-dropdown-menu'
import { MountainIcon } from 'lucide-react'

const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background px-6">
      <Link href="/dashboard" className="flex items-center gap-2">
        <MountainIcon className="h-6 w-6" />
        <span className="text-lg font-semibold">Redditly</span>
      </Link>
      <nav className="flex items-center gap-4">
      <Link href="/dashboard" className="text-md font-medium hover:text-primary">
          Dashboard
        </Link>
        <Link href="/dashboard/outreach" className="text-md font-medium hover:text-primary">
          Outreach
        </Link>
          <Link href="/dashboard/content-management" className="text-md font-medium hover:text-primary">
          Content
        </Link>
        <Link href="/dashboard/results" className="text-md font-medium hover:text-primary">
          Results
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Image
                src="/placeholder.svg"
                width={32}
                height={32}
                alt="Avatar"
                className="rounded-full"
                style={{ objectFit: "cover" }}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  )
}

export default Navbar