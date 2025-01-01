import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React from 'react'
import { AppSidebar } from '../_components/app-sidebar'

type Props = {
   children: React.ReactNode
}

const SideBarLayout = ({children}: Props) => {
  return (
    <SidebarProvider suppressHydrationWarning>
      {/* App Sidebar */}
      <AppSidebar />

      <main className="overflow-x-hidden">
        <div className="flex items-center gap-2 rounded-md border border-sidebar bg-sidebar p-2 px-4 shadow">
          <SidebarTrigger className="-ml-1" />
          {/* <SearchBar/> */}
          <div className="ml-auto"></div>
          <UserButton />
        </div>
        <div className="h-4"></div>
        {/* main content */}
        <div className="h-[calc(100vh-5rem)] overflow-y-scroll rounded-md border border-sidebar bg-sidebar p-2 px-4 shadow m-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}

export default SideBarLayout