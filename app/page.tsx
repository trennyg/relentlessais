import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScanLineDivider from '@/components/ScanLineDivider'
import CustomCursor from '@/components/CustomCursor'
import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'
import Work from '@/components/sections/Work'
import Testimonials from '@/components/sections/Testimonials'
import About from '@/components/sections/About'
import Contact from '@/components/sections/Contact'

export default function Home() {
  return (
    <>
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <ScanLineDivider />
        <Services />
        <Work />
        <Testimonials />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
