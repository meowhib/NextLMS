import Link from "next/link"
import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  PlusIcon,
  Search,
  Users,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"

export default function Dashboard() {
  const courses = [
      {
          "title": "React for Designers",
          "description": "Learn how to build a modern React application.",
          "progress": 75,
          "slug": "react-for-designers"
      },
      {
          "title": "Vue for Designers",
          "description": "Learn how to build a modern Vue application.",
          "progress": 50,
          "slug": "vue-for-designers"
      },
      {
          "title": "Angular for Designers",
          "description": "Learn how to build a modern Angular application.",
          "progress": 25,
          "slug": "angular-for-designers"
      },
      {
          "title": "Svelte for Designers",
          "description": "Learn how to build a modern Svelte application.",
          "progress": 10,
          "slug": "svelte-for-designers"
      },
      {
          "title": "Next.js for Designers",
          "description": "Learn how to build a modern Next.js application.",
          "progress": 90,
          "slug": "next-js-for-designers"
      },
      {
          "title": "Nuxt.js for Designers",
          "description": "Learn how to build a modern Nuxt.js application.",
          "progress": 80,
          "slug": "nuxt-js-for-designers"
      },
      {
          "title": "Gatsby for Designers",
          "description": "Learn how to build a modern Gatsby application.",
          "progress": 70,
          "slug": "gatsby-for-designers"
      },
      {
          "title": "Gridsome for Designers",
          "description": "Learn how to build a modern Gridsome application.",
          "progress": 60,
          "slug": "gridsome-for-designers"
      }
  ]

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="#"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Package2 className="h-6 w-6" />
            <span className="sr-only">Acme Inc</span>
          </Link>
          <Link
            href="#"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Orders
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Products
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Customers
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Analytics
          </Link>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Package2 className="h-6 w-6" />
                <span className="sr-only">Acme Inc</span>
              </Link>
              <Link href="#" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Orders
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Products
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Customers
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Analytics
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Subscriptions
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                +201 since last hour
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold leading-none tracking-tight">Courses</h1>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
              {
                courses.map((course, index) => (
                  <Link href={"/courses/" + course.slug} key={course.slug} passHref={true}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-bold">
                        {course.title}
                      </CardTitle>
                      { course.description && (
                        <CardDescription>{course.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Progress value={course.progress} className="h-2">
                      <div className="mb-1 flex w-full justify-between">
                        <Label className="text-sm">Progress</Label>
                        <span className="text-sm">60%</span>
                      </div>
                      </Progress>
                    </CardContent>
                  </Card>
                  </Link>
                ))
              }
              <div className="w-full h-full bg-gray-300 hover:bg-gray-400 hover:transition-all duration-150 rounded-lg relative">
                <div className="absolute w-full h-full flex justify-center items-center">
                  <Button className="bg-gray-0 hover:bg-gray-0 text-gray-900 h-full w-full font-semibold">
                    <PlusIcon className="h-4 h-4 mr-2" />
                    Add new course
                  </Button>
                </div>
                <Card className="invisible">
                  <CardHeader>
                    <CardTitle className="font-bold">
                      Hidden
                    </CardTitle>
                      <CardDescription>Hidden</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={0} className="h-2">
                    <div className="mb-1 flex w-full justify-between">
                      <Label className="text-sm">Progress</Label>
                      <span className="text-sm">60%</span>
                    </div>
                    </Progress>
                  </CardContent>
                </Card>
              </div>
          </div>
        </div>
      </main>
    </div>
  )
}
