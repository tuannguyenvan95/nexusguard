export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
      </div>
      
      <div className="relative z-10 w-full p-4 flex justify-center">
        {children}
      </div>
    </div>
  )
}
