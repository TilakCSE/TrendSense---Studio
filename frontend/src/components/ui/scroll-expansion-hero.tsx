'use client';

import { useEffect, useRef, useState, ReactNode, TouchEvent, WheelEvent } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [isMobileState, setIsMobileState] = useState<boolean>(false);

  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
  }, [mediaType]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!sectionRef.current) return;
      
      // FIXED MATH: Calculate exact screen position, ignoring offsetTop bugs
      const rect = sectionRef.current.getBoundingClientRect();
      const isAtTop = rect.top <= 10 && rect.top >= -10;

      if (isAtTop) {
        if (!mediaFullyExpanded && e.deltaY > 0) {
          e.preventDefault();
          const newProgress = Math.min(scrollProgress + e.deltaY * 0.001, 1);
          setScrollProgress(newProgress);
          if (newProgress >= 1) {
            setMediaFullyExpanded(true);
            setShowContent(true);
          }
        } else if (scrollProgress > 0 && e.deltaY < 0) {
          e.preventDefault();
          const newProgress = Math.max(scrollProgress + e.deltaY * 0.001, 0);
          setScrollProgress(newProgress);
          if (newProgress <= 0) {
            setMediaFullyExpanded(false);
            setShowContent(false);
          } else {
            setMediaFullyExpanded(false);
          }
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY || !sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const isAtTop = rect.top <= 10 && rect.top >= -10;
      
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      if (isAtTop) {
        if (!mediaFullyExpanded && deltaY > 0) {
          e.preventDefault();
          const newProgress = Math.min(scrollProgress + deltaY * 0.005, 1);
          setScrollProgress(newProgress);
          if (newProgress >= 1) {
            setMediaFullyExpanded(true);
            setShowContent(true);
          }
          setTouchStartY(touchY);
        } else if (scrollProgress > 0 && deltaY < 0) {
          e.preventDefault();
          const newProgress = Math.max(scrollProgress + deltaY * 0.005, 0);
          setScrollProgress(newProgress);
          if (newProgress <= 0) {
            setMediaFullyExpanded(false);
            setShowContent(false);
          } else {
            setMediaFullyExpanded(false);
          }
          setTouchStartY(touchY);
        }
      }
    };

    const handleTouchEnd = (): void => {
      setTouchStartY(0);
    };

    window.addEventListener('wheel', handleWheel as unknown as EventListener, { passive: false });
    window.addEventListener('touchstart', handleTouchStart as unknown as EventListener, { passive: false });
    window.addEventListener('touchmove', handleTouchMove as unknown as EventListener, { passive: false });
    window.addEventListener('touchend', handleTouchEnd as EventListener);

    return () => {
      window.removeEventListener('wheel', handleWheel as unknown as EventListener);
      window.removeEventListener('touchstart', handleTouchStart as unknown as EventListener);
      window.removeEventListener('touchmove', handleTouchMove as unknown as EventListener);
      window.removeEventListener('touchend', handleTouchEnd as EventListener);
    };
  }, [scrollProgress, mediaFullyExpanded, touchStartY]);

  useEffect(() => {
    const checkIfMobile = (): void => setIsMobileState(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const mediaWidth = 300 + scrollProgress * (isMobileState ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobileState ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobileState ? 180 : 150);

  const firstWord = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

  return (
    <div ref={sectionRef} className='transition-colors duration-700 ease-in-out overflow-x-hidden'>
      <section className='relative flex flex-col items-center justify-start min-h-[100dvh]'>
        <div className='relative w-full flex flex-col items-center min-h-[100dvh]'>
          <motion.div
            className='absolute inset-0 z-0 h-full'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
          >
            <Image
              src={bgImageSrc}
              alt='Background'
              width={1920}
              height={1080}
              className='w-screen h-screen'
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              priority
            />
            <div className='absolute inset-0 bg-[#3B0014]/40 mix-blend-multiply' />
          </motion.div>

          <div className='container mx-auto flex flex-col items-center justify-start relative z-10'>
            <div className='flex flex-col items-center justify-center w-full h-[100dvh] relative'>
              <div
                className='absolute z-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-none rounded-xl overflow-hidden'
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: '95vw',
                  maxHeight: '85vh',
                  boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div className='relative w-full h-full'>
                  <Image
                    src={mediaSrc}
                    alt={title || 'Media content'}
                    width={1280}
                    height={720}
                    className='w-full h-full object-cover'
                  />
                  <motion.div
                    className='absolute inset-0 bg-[#3B0014]/60'
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: 0.7 - scrollProgress * 0.3 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>

                <div className='flex flex-col items-center text-center relative z-10 mt-4 transition-none'>
                  {date && (
                    <p className='text-xl tracking-widest uppercase text-[#F0E7C2] opacity-80' style={{ transform: `translateX(-${textTranslateX}vw)` }}>
                      {date}
                    </p>
                  )}
                  {scrollToExpand && (
                    <p className='text-[#F0E7C2] font-medium text-center uppercase tracking-widest text-xs mt-2' style={{ transform: `translateX(${textTranslateX}vw)` }}>
                      {scrollToExpand}
                    </p>
                  )}
                </div>
              </div>

              <div
                className={`flex items-center justify-center text-center gap-4 w-full relative z-10 transition-none flex-col ${
                  textBlend ? 'mix-blend-difference' : 'mix-blend-normal'
                }`}
              >
                <motion.h2
                  className='text-6xl md:text-8xl lg:text-9xl font-serif tracking-tighter text-[#F0E7C2] transition-none'
                  style={{ transform: `translateX(-${textTranslateX}vw)` }}
                >
                  {firstWord}
                </motion.h2>
                <motion.h2
                  className='text-6xl md:text-8xl lg:text-9xl font-serif tracking-tighter text-center text-[#F0E7C2] transition-none'
                  style={{ transform: `translateX(${textTranslateX}vw)` }}
                >
                  {restOfTitle}
                </motion.h2>
              </div>
            </div>

            <motion.section
              className='flex flex-col w-full px-8 py-10 md:px-16 lg:py-20 min-h-screen bg-[#3B0014]'
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;