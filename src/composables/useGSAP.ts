import { ref, onUnmounted } from 'vue'
import { gsap } from 'gsap'

export function useGSAP() {
  const timeline = ref<gsap.core.Timeline | null>(null)

  const createTimeline = (options?: gsap.TimelineVars) => {
    timeline.value = gsap.timeline(options)
    return timeline.value
  }

  const fadeIn = (target: string | Element, options?: gsap.TweenVars) => {
    return gsap.fromTo(target, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', ...options }
    )
  }

  const slideInLeft = (target: string | Element, options?: gsap.TweenVars) => {
    return gsap.fromTo(target,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out', ...options }
    )
  }

  const slideInRight = (target: string | Element, options?: gsap.TweenVars) => {
    return gsap.fromTo(target,
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out', ...options }
    )
  }

  const scaleIn = (target: string | Element, options?: gsap.TweenVars) => {
    return gsap.fromTo(target,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)', ...options }
    )
  }

  const staggerAnimation = (targets: string | Element[], options?: gsap.TweenVars) => {
    return gsap.fromTo(targets,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1, ...options }
    )
  }

  const pulse = (target: string | Element, options?: gsap.TweenVars) => {
    return gsap.to(target, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1,
      ...options
    })
  }

  const shake = (target: string | Element, options?: gsap.TweenVars) => {
    return gsap.to(target, {
      x: -10,
      duration: 0.1,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 5,
      ...options
    })
  }

  // Animation générique pour les éléments au montage
  const animateOnMount = (selector: string | Element, animation: 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'scaleIn' = 'fadeIn', delay = 0) => {
    const animations = {
      fadeIn: () => fadeIn(selector, { delay }),
      slideInLeft: () => slideInLeft(selector, { delay }),
      slideInRight: () => slideInRight(selector, { delay }),
      scaleIn: () => scaleIn(selector, { delay })
    }
    return animations[animation]()
  }

  onUnmounted(() => {
    if (timeline.value) {
      timeline.value.kill()
    }
  })

  return {
    timeline,
    createTimeline,
    fadeIn,
    slideInLeft,
    slideInRight,
    scaleIn,
    staggerAnimation,
    pulse,
    shake,
    animateOnMount,
    gsap
  }
}
