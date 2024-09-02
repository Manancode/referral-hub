/**
 * v0 by Vercel.
 * @see https://v0.dev/t/FSb9fYz6ItF
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function Component() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background px-6">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <MountainIcon className="h-6 w-6" />
          <span className="text-lg font-semibold">Redditly</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="#" className="text-sm font-medium hover:text-primary" prefetch={false}>
            Projects
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary" prefetch={false}>
            Search Queue
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary" prefetch={false}>
            Insights
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <img
                  src="/placeholder.svg"
                  width={32}
                  height={32}
                  alt="Avatar"
                  className="rounded-full"
                  style={{ aspectRatio: "32/32", objectFit: "cover" }}
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
      <main className="flex-1 px-6 py-8">
        <div className="grid gap-8">
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Projects</h2>
              <Button>Create Project</Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div className="text-lg font-semibold">Project A</div>
                  <Badge variant="secondary">Active</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span>In Progress</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Leads</span>
                      <span>23</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Searches</span>
                      <span>12</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Last updated: 2 days ago</div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <FilePenIcon className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div className="text-lg font-semibold">Project B</div>
                  <Badge variant="outline">Paused</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span>Paused</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Leads</span>
                      <span>12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Searches</span>
                      <span>6</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Last updated: 1 week ago</div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <FilePenIcon className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div className="text-lg font-semibold">Project C</div>
                  <Badge variant="secondary">Active</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span>In Progress</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Leads</span>
                      <span>45</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Searches</span>
                      <span>22</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Last updated: 3 days ago</div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <FilePenIcon className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div className="text-lg font-semibold">Project D</div>
                  <Badge variant="outline">Completed</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span>Completed</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Leads</span>
                      <span>78</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Searches</span>
                      <span>32</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Last updated: 2 weeks ago</div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <FilePenIcon className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </section>
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Search Queue</h2>
              <Button>New Search</Button>
            </div>
            <div className="grid gap-4">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div className="text-lg font-semibold">Search A</div>
                  <Badge variant="secondary">Active</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span>In Progress</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Leads</span>
                      <span>23</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Progress</span>
                      <Progress value={75} aria-label="75% complete" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Last updated: 2 hours ago</div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <PauseIcon className="h-4 w-4" />
                        <span className="sr-only">Pause</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <RefreshCwIcon className="h-4 w-4" />
                        <span className="sr-only">Refresh</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div className="text-lg font-semibold">Search B</div>
                  <Badge variant="outline">Paused</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span>Paused</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Leads</span>
                      <span>12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Progress</span>
                      <Progress value={50} aria-label="50% complete" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Last updated: 1 day ago</div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <PlayIcon className="h-4 w-4" />
                        <span className="sr-only">Resume</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <RefreshCwIcon className="h-4 w-4" />
                        <span className="sr-only">Refresh</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div className="text-lg font-semibold">Search C</div>
                  <Badge variant="outline">Completed</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span>Completed</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Leads</span>
                      <span>45</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Progress</span>
                      <Progress value={100} aria-label="100% complete" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Last updated: 3 days ago</div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <RefreshCwIcon className="h-4 w-4" />
                        <span className="sr-only">Refresh</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </section>
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Insights</h2>
              <Button>View All</Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div className="text-lg font-semibold">Total Leads</div>
                </CardHeader>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function FilePenIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" />
    </svg>
  )
}


function MountainIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  )
}


function PauseIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="14" y="4" width="4" height="16" rx="1" />
      <rect x="6" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}


function PlayIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  )
}


function RefreshCwIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  )
}


function TrashIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}