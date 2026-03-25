import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Roofing.scss";
import video from "../assets/img/video.mp4";

const ServiceConcrete = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  const [sliderPositions, setSliderPositions] = useState({});
  const projectsRef = useRef(null);
  const sliderRefs = useRef({});
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const smoothScrollTo = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleProjectClick = () => {
    navigate("/contact");
  };

  const toggleVideo = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Fallback for devices without IntersectionObserver support
    if (!window.IntersectionObserver) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1, // Lower threshold for better mobile compatibility
      }
    );

    if (projectsRef.current) {
      observer.observe(projectsRef.current);
    }

    // Fallback timer in case IntersectionObserver fails
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => {
      if (projectsRef.current) {
        observer.unobserve(projectsRef.current);
      }
      clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    // Initialize slider positions to 50% for all projects
    const initialPositions = {};
    projects.forEach((project) => {
      initialPositions[project.id] = 50;
    });
    setSliderPositions(initialPositions);
  }, []);

  const handleSliderMove = (projectId, event, isDragging = false) => {
    if (!isDragging && event.type !== "click") return;

    const slider = sliderRefs.current[projectId];
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

    setSliderPositions((prev) => ({
      ...prev,
      [projectId]: percentage,
    }));
  };

  const handleMouseDown = (projectId) => (event) => {
    event.preventDefault();

    const handleMouseMove = (moveEvent) => {
      handleSliderMove(projectId, moveEvent, true);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    handleSliderMove(projectId, event, true);
  };

  const handleTouchStart = (projectId) => (event) => {
    // Don't use preventDefault at all to avoid passive event issues
    
    const handleTouchMove = (moveEvent) => {
      if (moveEvent.touches && moveEvent.touches[0]) {
        const touchEvent = {
          clientX: moveEvent.touches[0].clientX,
        };
        handleSliderMove(projectId, touchEvent, true);
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    // Remove passive: false to avoid conflicts
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);

    if (event.touches && event.touches[0]) {
      const touchEvent = {
        clientX: event.touches[0].clientX,
      };
      handleSliderMove(projectId, touchEvent, true);
    }
  };

  const projects = [
    {
      id: 1,
      title: "Foundation Concrete",
      type: "Structural Foundation",
      closeImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
      farImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      description:
        "Professional concrete foundation work providing a solid and durable base for your construction with reinforced materials.",
    },
    {
      id: 2,
      title: "Decorative Concrete",
      type: "Stamped & Colored Finishes",
      closeImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
      farImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      description:
        "Beautiful decorative concrete solutions for driveways, patios, and walkways with custom stamped patterns and colors.",
    },
    {
      id: 3,
      title: "Commercial Concrete",
      type: "Industrial Applications",
      closeImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
      farImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      description:
        "Large-scale concrete projects for commercial properties including parking lots, sidewalks, and industrial flooring.",
    },
    {
      id: 4,
      title: "Concrete Repair",
      type: "Restoration Services",
      closeImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
      farImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      description:
        "Expert concrete repair services for cracks, chips, and structural damage with waterproofing and surface restoration.",
    },
  ];

  return (
    <section id="concrete" className="roofing" ref={projectsRef}>
      <div className="roofing-container">
        <div className={`roofing-header ${isVisible ? "animate" : ""}`}>
          <div className="breadcrumb">
            <span onClick={() => navigate("/services")} className="breadcrumb-link">Services</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Concrete</span>
          </div>
          <div className="section-label">Concrete Services</div>
          <h2>Professional Concrete Solutions</h2>
          <p>
            Quality concrete services for foundations, driveways, patios, and decorative applications.
            From new construction to repairs, we deliver durable concrete work that stands the test of time.
          </p>
        </div>

        <div className="roofing-grid">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`project-card ${isVisible ? "animate" : ""}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="project-images">
                <div
                  className="before-after-slider"
                  ref={(el) => (sliderRefs.current[project.id] = el)}
                  onClick={(e) => handleSliderMove(project.id, e)}
                >
                  <div className="after-image">
                    <img
                      src={project.farImage}
                      alt={`${project.title} - Far View`}
                    />
                  </div>
                  <div
                    className="before-image"
                    style={{
                      clipPath: `inset(0 ${
                        100 - (sliderPositions[project.id] || 50)
                      }% 0 0)`,
                    }}
                  >
                    <img
                      src={project.closeImage}
                      alt={`${project.title} - Close Up`}
                    />
                  </div>
                  <div
                    className="slider-handle"
                    style={{ left: `${sliderPositions[project.id] || 50}%` }}
                    onMouseDown={handleMouseDown(project.id)}
                    onTouchStart={handleTouchStart(project.id)}
                  >
                    <div className="slider-line"></div>
                    <div className="slider-button">
                      <span className="material-icons">compare</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="project-overlay">
                <div className="project-info">
                  <div className="project-meta">
                    <span className="project-type">{project.type}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="video-container">
          <div className="video-wrapper">
            <video src={video} ref={videoRef} muted playsInline />
            <button className="video-play-button" onClick={toggleVideo}>
              <span className="material-icons">
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>
          </div>
        </div>
        
        <div className={`roofing-cta ${isVisible ? "animate" : ""}`}>
          <div className="cta-content">
            <h3>Ready to Build on Solid Ground?</h3>
            <p>
              Join hundreds of satisfied customers who trust us with their
              concrete and foundation needs
            </p>
          </div>
          <button className="cta-button" onClick={handleProjectClick}>
            Schedule your consultation today
            <span className="material-icons">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServiceConcrete;