import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCourses } from "@/hooks/useCourses";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const GRADIENT_CLASSES = [
  "bg-gradient-to-br from-orange-500 to-orange-700",
  "bg-gradient-to-br from-blue-500 to-blue-700",
  "bg-gradient-to-br from-purple-500 to-purple-700",
  "bg-gradient-to-br from-green-500 to-green-700",
  "bg-gradient-to-br from-pink-500 to-pink-700",
  "bg-gradient-to-br from-indigo-500 to-indigo-700",
  "bg-gradient-to-br from-teal-500 to-teal-700",
  "bg-gradient-to-br from-red-500 to-red-700",
];

const BannerCards = () => {
  const { courses, isLoading } = useCourses();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardsPerView = 4;

  const canScrollNext = courses.length > cardsPerView && currentIndex < courses.length - cardsPerView;
  const canScrollPrev = currentIndex > 0;

  const handleNext = () => {
    if (canScrollNext) {
      setCurrentIndex((prev) => Math.min(prev + cardsPerView, courses.length - cardsPerView));
    }
  };

  const handlePrev = () => {
    if (canScrollPrev) {
      setCurrentIndex((prev) => Math.max(0, prev - cardsPerView));
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current && courses.length > cardsPerView) {
      const container = scrollContainerRef.current;
      const cardWidth = container.children[0]?.clientWidth || 280;
      const gap = 16; // gap-4 = 16px
      const scrollOffset = currentIndex * (cardWidth + gap);
      container.scrollTo({
        left: scrollOffset,
        behavior: 'smooth',
      });
    }
  }, [currentIndex, courses.length]);

  const getGradient = (index: number) => {
    return GRADIENT_CLASSES[index % GRADIENT_CLASSES.length];
  };

  if (isLoading) {
    return (
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 relative">
      <div className="relative overflow-hidden">
        <div
          ref={scrollContainerRef}
          className={cn(
            courses.length > cardsPerView 
              ? "flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide" 
              : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          )}
          style={{
            scrollbarWidth: courses.length > cardsPerView ? 'none' : 'auto',
            msOverflowStyle: courses.length > cardsPerView ? 'none' : 'auto',
          }}
        >
          {courses.map((course, index) => (
            <div
              key={course._id}
              className={cn(
                `${getGradient(index)} relative overflow-hidden rounded-lg p-6 text-white shadow-lg flex flex-col`,
                courses.length > cardsPerView ? "min-w-[280px] flex-shrink-0" : "h-full"
              )}
            >
              <div className="relative z-10 flex flex-col h-full">
                <span className="mb-2 inline-block rounded bg-white/20 px-2 py-1 text-xs font-medium w-fit">
                  {course.course_code}
                </span>
                <h3 className="mb-1 text-lg font-bold line-clamp-2">{course.course_name}</h3>
                {course.description && (
                  <p className="mb-3 text-xs opacity-80 line-clamp-2 flex-1">{course.description}</p>
                )}
                <div className="mt-auto">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white text-foreground hover:bg-white/90 w-full"
                  >
                    Bắt đầu học
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {courses.length > cardsPerView && (
        <>
          {canScrollPrev && (
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 h-10 w-10 rounded-full bg-white shadow-lg z-10"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          {canScrollNext && (
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 h-10 w-10 rounded-full bg-white shadow-lg z-10"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default BannerCards;
