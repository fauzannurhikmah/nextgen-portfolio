'use client'

import { useEffect } from 'react'
import Cursor from '@/components/ui/Cursor'
import Navbar from '@/components/ui/Navbar'
import HeroSection from '@/components/sections/HeroSection'
import MarqueeSection from '@/components/sections/MarqueeSection'
import AboutSection from '@/components/sections/AboutSection'
import SkillsSection from '@/components/sections/SkillsSection'
import ThreeDSection from '@/components/sections/ThreeDSection'
import ProjectsSection from '@/components/sections/ProjectsSection'
import ExperienceSection from '@/components/sections/ExperienceSection'
import ContactSection from '@/components/sections/ContactSection'

export default function Home() {
  useEffect(() => {
    // Nav solid on scroll
    const handleScroll = () => {
      const nav = document.getElementById('nav')
      if (nav) {
        nav.classList.toggle('nav-solid', window.scrollY > 60)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Cursor />
      <Navbar />
      <main>
        <HeroSection />
        <MarqueeSection />
        <AboutSection />
        <SkillsSection />
        <ThreeDSection />
        <ProjectsSection />
        <ExperienceSection />
        <ContactSection />
      </main>
    </>
  )
}
