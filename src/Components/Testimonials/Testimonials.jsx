import React, { useState, useEffect, useRef } from "react";
import "./Testimonials.scss";

const Testimonials = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const testimonialsRef = useRef(null);
  const sliderRef = useRef(null);
  const autoPlayRef = useRef(null);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Homeowner",
      location: "Downtown District",
      rating: 5,
      text: "Zenith Roofing exceeded our expectations! They replaced our entire roof after storm damage and the quality is outstanding. Professional, punctual, and affordable.",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "Business Owner",
      location: "Business Park",
      rating: 5,
      text: "Our commercial building needed a complete roof overhaul. Zenith handled everything seamlessly with minimal disruption to our operations. Highly recommend!",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      title: "Property Manager",
      location: "Suburban Area",
      rating: 5,
      text: "Fast emergency response when we had a leak during the storm. They had it fixed the same day and followed up with a full inspection. True professionals.",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 4,
      name: "David Thompson",
      title: "Homeowner",
      location: "Heritage District",
      rating: 5,
      text: "They restored our historic home's slate roof beautifully. Attention to detail was incredible and they respected the original architecture perfectly.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 5,
      name: "Lisa Park",
      title: "Real Estate Agent",
      location: "City Center",
      rating: 5,
      text: "I recommend Zenith to all my clients. They consistently deliver quality work on time and within budget. Their warranties give peace of mind.",
      avatar:
        "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 6,
      name: "Robert Wilson",
      title: "Contractor",
      location: "Industrial Zone",
      rating: 5,
      text: "As a fellow contractor, I appreciate their professionalism and craftsmanship. Zenith sets the standard for roofing excellence in our area.",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
  ];

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.3,
      }
    );

    if (testimonialsRef.current) {
      observer.observe(testimonialsRef.current);
    }

    return () => {
      if (testimonialsRef.current) {
        observer.unobserve(testimonialsRef.current);
      }
    };
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000); // Change slide every 4 seconds
    } else {
      clearInterval(autoPlayRef.current);
    }

    return () => clearInterval(autoPlayRef.current);
  }, [isAutoPlaying, testimonials.length]);

  // Navigation functions
  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    const newIndex =
      currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex =
      currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  };

  // Touch/Swipe functionality
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex]);

  // Calculate how many slides to show based on screen size
  const getSlidesToShow = () => {
    if (window.innerWidth >= 1200) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const [slidesToShow, setSlidesToShow] = useState(getSlidesToShow());

  useEffect(() => {
    const handleResize = () => {
      setSlidesToShow(getSlidesToShow());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - slidesToShow);

  return (
    <section id="testimonials" className="testimonials" ref={testimonialsRef}>
      <div className="testimonials-container">
        <div className={`testimonials-header ${isVisible ? "animate" : ""}`}>
          <div className="section-label">What Our Clients Say</div>
          <h2>Trusted by Hundreds</h2>
          <p>See why our customers choose us for their roofing needs</p>
        </div>

        <div className="testimonials-slider">
          <div className="slider-container">
            {/* Previous Button */}
            <button
              className="slider-nav prev"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              aria-label="Previous testimonial"
            >
              <span className="material-icons">chevron_left</span>
            </button>

            {/* Slider Track */}
            <div
              className="testimonials-wrapper"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="testimonials-track"
                ref={sliderRef}
                style={{
                  transform: `translateX(-${
                    (currentIndex * 100) / slidesToShow
                  }%)`,
                  width: `${(testimonials.length * 100) / slidesToShow}%`,
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.id}
                    className={`testimonial-card ${isVisible ? "animate" : ""}`}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      width: `${100 / testimonials.length}%`,
                    }}
                  >
                    <div className="testimonial-content">
                      <div className="quote-icon">
                        <span className="material-icons">format_quote</span>
                      </div>
                      <p className="testimonial-text">{testimonial.text}</p>
                      <div className="rating">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className="material-icons star">
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="testimonial-author">
                      <div className="author-avatar">
                        <img src={testimonial.avatar} alt={testimonial.name} />
                      </div>
                      <div className="author-info">
                        <h4>{testimonial.name}</h4>
                        <p className="author-title">{testimonial.title}</p>
                        <div className="author-location">
                          <span className="material-icons">place</span>
                          {testimonial.location}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <button
              className="slider-nav next"
              onClick={goToNext}
              disabled={currentIndex >= maxIndex}
              aria-label="Next testimonial"
            >
              <span className="material-icons">chevron_right</span>
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="slider-dots">
            {Array.from({ length: maxIndex + 1 }, (_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? "active" : ""}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Auto-play Controls */}
          <div className="slider-controls">
            <button
              className={`play-pause ${isAutoPlaying ? "playing" : "paused"}`}
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              aria-label={isAutoPlaying ? "Pause auto-play" : "Start auto-play"}
            >
              <span className="material-icons">
                {isAutoPlaying ? "pause" : "play_arrow"}
              </span>
            </button>
          </div>
        </div>

        <div className={`testimonials-stats ${isVisible ? "animate" : ""}`}>
          <div className="stat">
            <div className="stat-number">500+</div>
            <div className="stat-label">Happy Customers</div>
          </div>
          <div className="stat">
            <div className="stat-number">15+</div>
            <div className="stat-label">Years Experience</div>
          </div>
          <div className="stat">
            <div className="stat-number">100%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
          <div className="stat">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Emergency Service</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
