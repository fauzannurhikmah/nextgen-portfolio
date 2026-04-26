'use client'

import { useEffect, useRef } from 'react'

export default function Cursor() {
  const curRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.innerWidth <= 900) return

    let cx = window.innerWidth / 2
    let cy = window.innerHeight / 2
    let rx = cx
    let ry = cy
    let raf: number

    const onMove = (e: MouseEvent) => {
      cx = e.clientX
      cy = e.clientY
    }
    document.addEventListener('mousemove', onMove)

    const tick = () => {
      rx += (cx - rx) * 0.15
      ry += (cy - ry) * 0.15
      if (curRef.current) {
        curRef.current.style.left = cx + 'px'
        curRef.current.style.top = cy + 'px'
      }
      if (ringRef.current) {
        ringRef.current.style.left = rx - cx + 'px'
        ringRef.current.style.top = ry - cy + 'px'
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const hoverEls = document.querySelectorAll(
      'a, button, .proj-item, .strength-row'
    )
    const addHover = () => document.body.classList.add('hovering')
    const rmHover = () => document.body.classList.remove('hovering')

    // Use delegation for dynamic elements
    document.addEventListener('mouseover', (e) => {
      const el = (e.target as Element).closest(
        'a, button, .proj-item, .strength-row'
      )
      if (el) addHover()
    })
    document.addEventListener('mouseout', (e) => {
      const el = (e.target as Element).closest(
        'a, button, .proj-item, .strength-row'
      )
      if (el) rmHover()
    })

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div id="cur" ref={curRef} className="hidden md:block">
      <div className="cur-dot" />
      <div ref={ringRef} className="cur-ring" />
    </div>
  )
}
