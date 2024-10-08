import React from 'react'
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

function MountainIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
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

export default function Settings() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="#" className="flex items-center justify-center">
          <MountainIcon className="h-6 w-6" />
          <span className="sr-only">Acme Inc</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
            Dashboard
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
            Deployments
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
            Analytics
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
            Logs
          </Link>
          <Link href="#" className="text-sm font-medium text-primary underline underline-offset-4">
            Settings
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <div className="max-w-6xl w-full mx-auto grid gap-2 px-4 md:px-6 py-8">
          <h1 className="text-3xl font-semibold">Settings</h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Account Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account information and settings.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue="John Doe" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john@example.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
            {/* Subscription Card */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>View and manage your current subscription plan.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Pro Plan</div>
                      <div className="text-sm text-muted-foreground">Billed monthly</div>
                    </div>
                    <div className="text-2xl font-semibold">$49</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Storage</div>
                      <div className="text-sm text-muted-foreground">100GB</div>
                    </div>
                    <div className="text-2xl font-semibold">100GB</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Bandwidth</div>
                      <div className="text-sm text-muted-foreground">1TB</div>
                    </div>
                    <div className="text-2xl font-semibold">1TB</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Upgrade Plan</Button>
              </CardFooter>
            </Card>
            {/* Billing Card */}
            <Card>
              <CardHeader>
                <CardTitle>Billing</CardTitle>
                <CardDescription>View and manage your billing information.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" defaultValue="**** **** **** 1234" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label htmlFor="expiry-date">Expiry Date</Label>
                      <Input id="expiry-date" defaultValue="12/24" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" defaultValue="123" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Billing Address</Label>
                    <Textarea id="address" defaultValue="123 Main St, Anytown USA" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Update Billing</Button>
              </CardFooter>
            </Card>
            {/* Notifications Card */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Customize your notification preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive updates and alerts via email</div>
                    </div>
                    <Checkbox id="email-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Push Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive real-time updates and alerts</div>
                    </div>
                    <Checkbox id="push-notifications" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">SMS Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive important updates via text message</div>
                    </div>
                    <Checkbox id="sms-notifications" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
            {/* Security Card */}
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your account security settings.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Two-Factor Authentication</div>
                      <div className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </div>
                    </div>
                    <Switch id="two-factor-auth" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Logout Sessions</div>
                      <div className="text-sm text-muted-foreground">Manage your active login sessions</div>
                    </div>
                    <Button variant="outline">Manage Sessions</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Delete Account</div>
                      <div className="text-sm text-muted-foreground">Permanently delete your account and data</div>
                    </div>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}