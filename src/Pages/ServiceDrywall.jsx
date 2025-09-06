import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Roofing.scss";
import video from "../assets/img/video.mp4";

const ServiceDrywall = () => {
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
      title: "Drywall Installation",
      type: "New Construction",
      closeImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
      farImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      description:
        "Professional drywall installation for new construction and remodeling projects with seamless finishes and quality materials.",
    },
    {
      id: 2,
      title: "Drywall Repair",
      type: "Restoration Services",
      closeImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
      farImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      description:
        "Expert drywall repair services for holes, cracks, and damage with texture and paint matching for invisible repairs.",
    },
    {
      id: 3,
      title: "Ceiling Installation",
      type: "Overhead Solutions",
      closeImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
      farImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      description:
        "Complete ceiling drywall installation and repair services including drop ceilings and acoustic solutions for all properties.",
    },
    {
      id: 4,
      title: "Wall Finishing",
      type: "Surface Preparation",
      closeImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
      farImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      description:
        "Professional wall finishing services including taping, mudding, sanding, and texture application for paint-ready surfaces.",
    },
  ];

  return (
    <section id="drywall" className="roofing" ref={projectsRef}>
      <div className="roofing-container">
        <div className={`roofing-header ${isVisible ? "animate" : ""}`}>
          <div className="breadcrumb">
            <span onClick={() => navigate("/services")} className="breadcrumb-link">Services</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Drywall</span>
          </div>
          <div className="section-label">Drywall Services</div>
          <h2>Professional Drywall Solutions</h2>
          <p>
            Expert drywall installation and repair services for perfect walls and ceilings.
            From new construction to repairs, we deliver seamless finishes with quality workmanship.
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
            <h3>Ready for Perfect Walls?</h3>
            <p>
              Join hundreds of satisfied customers who trust us with their
              drywall and finishing needs
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

export default ServiceDrywall;