import { Header } from "./components/Layout/Header"
import { Footer } from "./components/Layout/Footer"
import { ScrollToTop } from "./components/ui/ScrollToTop"
import Hero from "./components/Resume/Hero"
import { Education } from "./components/Resume/Education"
import { Experience } from "./components/Resume/Experience"
import { Skills } from "./components/Resume/Skills"
import { Projects } from "./components/Resume/Projects"
import { Videos } from "./components/Resume/Videos"
import { Contact } from "./components/Resume/Contact"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Hero />
        <Education />
        <Experience />
        <Skills />
        <Projects />
        <Videos />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App
