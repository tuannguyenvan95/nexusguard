import { TopHeader } from '@/components/layout/TopHeader'
import { BlueprintNav } from '@/components/layout/BlueprintNav'
import { Footer } from '@/components/layout/Footer'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-transparent text-white flex">
      {/* Main Content Area */}
      <main className="flex-1 min-h-screen flex flex-col w-full">
        <TopHeader />
        <BlueprintNav />

        <div className="p-4 md:p-8 mx-auto w-full max-w-screen-2xl flex-1">
          {children}
        </div>
        
        <Footer />
      </main>
    </div>
  )
}
