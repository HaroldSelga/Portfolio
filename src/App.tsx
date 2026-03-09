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
import Workspace from "./components/Workspace/Workspace.tsx"

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
      <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
        <ScrollToTop />
        <MobileBottomNav />
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomeLoader />} />
            <Route path="/workspace" element={<Workspace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

// Separate component to handle any home-specific logic if needed
function HomeLoader() {
  return <Home />
}

export default App
