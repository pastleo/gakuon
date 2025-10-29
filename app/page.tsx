import { LoginForm } from "@/components/login-form"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Gakuon</h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">Gakuon</h2>
              <p className="text-xl md:text-2xl text-muted-foreground text-pretty">
                {
                  "Learn while you listen. Transform your YouTube playlists into powerful learning sessions with flashcards between videos."
                }
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="text-sm text-muted-foreground">{"Perfect for language learners, music students, and visual thinkers"}</div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="flex justify-center lg:justify-end">
            <LoginForm />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          {"© 2025 Gakuon. All rights reserved."}
        </div>
      </footer>
    </div>
  )
}
