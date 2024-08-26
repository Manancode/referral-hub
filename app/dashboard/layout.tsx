import { NavbarNested } from './components/NavbarNested';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';
import classes from './components/NavbarNested.module.css'
import "../globals.css"; 

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }


  return (
    <div className={classes.dashboardlayout}>
      <div className={classes.navbar}>
      <NavbarNested/>
      </div>
      <main className={classes.maincontent}>
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
