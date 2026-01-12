'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';


import ReactPlayer from 'react-player';
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from './ui/carousel';
import { sliderItems } from '@/constants';

function SecondHeroSection() {
  const slidesData = sliderItems
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const AUTOPLAY_DURATION = 5000;
  const TICK_RATE = 50;

  // Sync State on Slide Change
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const idx = api.selectedScrollSnap();
      setCurrentSlide(idx);
      setProgress(0);
    };
    const onPointerDown = () => setIsPaused(true);
    const onPointerUp = () => setIsPaused(false);

    api.on('select', onSelect);
    api.on('pointerDown', onPointerDown);
    api.on('pointerUp', onPointerUp);

    setCurrentSlide(api.selectedScrollSnap());

    return () => {
      api.off('select', onSelect);
      api.off('pointerDown', onPointerDown);
      api.off('pointerUp', onPointerUp);
    };
  }, [api]);

  // Progress Timer & Sequential Loop (only when not paused)
  useEffect(() => {
    if (!api || isPaused) return;

    let animating = false;
    const progressIncrement = 100 / (AUTOPLAY_DURATION / TICK_RATE);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Only advance if not animating
          if (!animating && api.canScrollNext()) {
            animating = true;
            api.scrollNext();
            setTimeout(() => {
              animating = false;
            }, 500); // debounce
          }
          return 0;
        }
        return prev + progressIncrement;
      });
    }, TICK_RATE);

    return () => clearInterval(timer);
  }, [api, currentSlide, isPaused]);

  const handleJumpToSlide = (index: number) => {
    if (api) {
      setIsPaused(true);
      api.scrollTo(index);
      setTimeout(() => setIsPaused(false), 600); // resume autoplay after jump
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <Carousel
        setApi={setApi}
        className="h-full"
        orientation="vertical"
        opts={{
          loop: true,
          align: 'start',
          skipSnaps: false,
          dragFree: false,
          watchDrag: false,
        }}
      >
        <CarouselContent className="mt-0 h-[100vh]">
          {slidesData.map((slide, index) => (
            <CarouselItem key={index} className="h-full pt-0">
              <div className="relative h-full w-full">
                {slide.display_type === 'image' && slide.image ? (
                  <Image
                    src={slide.image}
                    alt={slide.image_title || slide.title}
                    fill
                    priority={index === 0}
                    className="object-cover"
                  />
                ) : slide.display_type === 'video' && slide.video_url ? (
                  <div className="relative h-screen w-full overflow-hidden">
                    <ReactPlayer
                      src={slide.video_url}
                      playing={true}
                      loop={true}
                      muted={true}
                      playsInline={true}
                      controls={false}
                      width="100%"
                      height="100%"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) scale(1.4)',
                        minWidth: '100%',
                        minHeight: '100%',
                      }}
                    />
                  </div>
                ) : null}
                <div className="absolute inset-0 bg-black/20" />

                <div
                  className="pointer-events-none absolute bottom-0 left-0 w-full"
                  style={{
                    height: '50%',
                    background:
                      'linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.0) 100%)',
                  }}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Floating UI Overlay */}
      <div className="absolute bottom-[20%] w-full">
        <div className="default-container flex w-full flex-row items-center justify-between">
          <div className="flex max-w-[808px] flex-col">
            <div className="flex flex-col">
              <h1 className="text-3xl leading-tight font-bold text-white lg:text-[40px]">
                {slidesData[currentSlide].title}
              </h1>
              <p className="mt-2 text-lg text-white/80">
                {slidesData[currentSlide].description}
              </p>
            </div>
            {slidesData[currentSlide].link?.[0] && (
              <Link
                href={slidesData[currentSlide].link[0].link}
                className="group"
              >
                <button className="bg-primary-800 hover:text-primary-800 hover:border-primary-800 mt-[56px] flex h-[56px] w-fit cursor-pointer items-center gap-3 rounded-none border border-white px-4 text-white transition-colors duration-300 ease-in-out hover:bg-transparent">
                  <Image
                    src="/icons/send.svg"
                    height={24}
                    width={24}
                    alt="Send Icon"
                    className="invert-logo transition duration-300"
                  />
                  {slidesData[currentSlide].link[0].link_name}
                </button>
              </Link>
            )}
          </div>

          {/* Numbers Navigation */}
          <div className="flex flex-col items-center gap-1 text-white">
            {slidesData.map((_, idx) => (
              <div
                key={idx}
                className="group flex cursor-pointer flex-col items-center"
                onClick={() => handleJumpToSlide(idx)}
              >
                <span
                  className={`transition-all duration-300 ${
                    currentSlide === idx
                      ? 'text-lg font-bold opacity-100'
                      : 'text-sm font-medium opacity-50 group-hover:opacity-80'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>

                <div
                  className={`relative my-1 flex w-2 justify-center overflow-hidden rounded-full transition-all duration-300 ease-out ${
                    currentSlide === idx ? 'h-14 opacity-100' : 'h-0 opacity-0'
                  }`}
                >
                  <div className="absolute top-0 h-full w-[2px] bg-white/20" />
                  <div
                    className="absolute top-0 w-[4px] rounded-full bg-white transition-all duration-100 ease-linear"
                    style={{
                      height: `${progress}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecondHeroSection;