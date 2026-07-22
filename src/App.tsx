import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import { Header } from "./components/Layout/Header"
import { Footer } from "./components/Layout/Footer"
import { ScrollToTop } from "./components/ui/ScrollToTop"
import { MobileBottomNav } from "./components/ui/MobileBottomNav"
import Hero from "./components/Resume/Hero"
import { Education } from "./components/Resume/Education"
import { Experience } from "./components/Resume/Experience"
import { Skills } from "./components/Resume/Skills"
import { Projects } from "./components/Resume/Projects"
import { Videos } from "./components/Resume/Videos"
import { Contact } from "./components/Resume/Contact"
import { ThemeProvider } from "./components/ThemeProvider"
import { Gatekeeper } from "./components/ui/Gatekeeper.tsx"
import { PortfolioProvider } from "./context/PortfolioContext.tsx"
import { Loader2 } from "lucide-react"

// Route-based lazy loading for heavy feature pages
const Workspace = lazy(() => import("./components/Workspace/Workspace.tsx"))
const Requirements = lazy(() => import("./components/Requirements/Requirements.tsx"))
const FinanceTracker = lazy(() => import("./components/Finance/FinanceTracker.tsx"))
const ResumeSettings = lazy(() => import("./components/Admin/ResumeSettings.tsx"))

function PageLoadingFallback() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 p-8 text-center">
      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary animate-pulse">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
        Loading module...
      </p>
    </div>
  )
}

function Home() {
  return (
    <>
      <Hero />
      <Education />
      <Experience />
      <Skills />
      <Projects />
      <Videos />
      <Contact />
    </>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <PortfolioProvider>
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
          <ScrollToTop />
          <MobileBottomNav />
          <Header />
          <main className="flex-1">
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                <Route path="/" element={<HomeLoader />} />
                <Route path="/workspace" element={<Gatekeeper><Workspace /></Gatekeeper>} />
                <Route path="/requirements" element={<Gatekeeper><Requirements /></Gatekeeper>} />
                <Route path="/finances" element={<Gatekeeper><FinanceTracker /></Gatekeeper>} />
                <Route path="/resume-settings" element={<Gatekeeper><ResumeSettings /></Gatekeeper>} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </PortfolioProvider>
    </ThemeProvider>
  )
}

// Separate component to handle any home-specific logic if needed
function HomeLoader() {
  return <Home />
}

export default App
