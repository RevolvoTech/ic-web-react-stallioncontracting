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
      text: "After the big storm last spring, I was stressed about finding someone reliable to fix our roof. These guys showed up when they said they would and didn't try to upsell me on anything I didn't need. The work looks great and we haven't had a single leak since.",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "Business Owner",
      location: "Business Park",
      rating: 5,
      text: "Running a business, the last thing you want is construction dragging on forever. They finished our roof in just three days and my employees barely noticed the work was happening. Really impressed with how they handled everything.",
      avatar:
        "https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      title: "Property Manager",
      location: "Suburban Area",
      rating: 5,
      text: "Water was literally dripping into our living room at 9 PM on a Saturday. I called them expecting to leave a voicemail, but someone actually answered and came out that night with a tarp. Fixed it properly the next week - saved our hardwood floors.",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 4,
      name: "David Thompson",
      title: "Homeowner",
      location: "Heritage District",
      rating: 5,
      text: "We bought this 1920s house and the slate roof was a mess. I was worried they'd want to just tear it all off, but they actually knew how to work with the original materials. Looks exactly like it should - you'd never know it was repaired.",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 5,
      name: "Lisa Park",
      title: "Real Estate Agent",
      location: "City Center",
      rating: 5,
      text: "I've been selling houses for 15 years and I've seen every kind of roofing job you can imagine. When my clients need work done, these are the only guys I trust. They do what they say they'll do, when they say they'll do it.",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 6,
      name: "Robert Wilson",
      title: "Contractor",
      location: "Industrial Zone",
      rating: 5,
      text: "I do electrical work, so I'm on a lot of job sites. You can always tell quality work when you see it. These guys know what they're doing - clean work, no shortcuts, and they actually clean up after themselves. That's rare these days.",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
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
        threshold: 0.1,
        rootMargin: "50px 0px -50px 0px",
      }
    );

    if (testimonialsRef.current) {
      observer.observe(testimonialsRef.current);
    }

    // Fallback timeout to ensure visibility on mobile devices
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => {
      if (testimonialsRef.current) {
        observer.unobserve(testimonialsRef.current);
      }
      clearTimeout(fallbackTimer);
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

  const maxIndex = testimonials.length - 1;

  return (
    <section id="testimonials" className="testimonials" ref={testimonialsRef}>
      <div className="testimonials-container">
        <div className={`testimonials-header ${isVisible ? "animate" : ""}`}>
          <div className="section-label">What Our Clients Say</div>
          <h2>Trusted by Hundreds</h2>
          <p>See why our customers choose us for their roofing needs</p>
        </div>

        <div className="testimonials-slider">
          {/* Previous Button */}
          <button
            className="slider-nav prev"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            aria-label="Previous testimonial"
          >
            <span className="material-icons">chevron_left</span>
          </button>

          {/* Slider Container */}
          <div className="testimonials-container-slider">
            <div 
              className="testimonials-track"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`testimonial-card ${isVisible ? "animate" : ""}`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
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

        {/* Carousel Controls Below Cards */}
        <div className="carousel-controls">
          {/* Dots Indicator */}
          <div className="slider-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? "active" : ""}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className={`testimonials-stats ${isVisible ? "animate" : ""}`}>
          <div className="stat">
            <div className="stat-number">305+</div>
            <div className="stat-label">Happy Clients</div>
          </div>
          <div className="stat">
            <div className="stat-number">25+</div>
            <div className="stat-label">Years Experience</div>
          </div>
          <div className="stat">
            <div className="stat-number">100%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
          <div className="stat">
            <div className="stat-number">15+</div>
            <div className="stat-label">Team Members</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
