import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Roofing.scss";
import video from "../assets/img/video.mp4";

const ServiceElectrical = () => {
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
      title: "Panel Upgrades",
      type: "Electrical Panel Systems",
      closeImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
      farImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      description:
        "Professional electrical panel upgrades for increased capacity and safety compliance with modern electrical codes.",
    },
    {
      id: 2,
      title: "Commercial Wiring",
      type: "Industrial Electrical Systems",
      closeImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
      farImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
      description:
        "Complete commercial electrical installations with high-capacity wiring and professional-grade components.",
    },
    {
      id: 3,
      title: "Smart Home Systems",
      type: "Home Automation",
      closeImage: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
      farImage: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
      description:
        "Modern smart home electrical integration including automation, security systems, and energy management.",
    },
    {
      id: 4,
      title: "Lighting Installation",
      type: "LED & Traditional Systems",
      closeImage: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80",
      farImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      description:
        "Professional lighting installation for residential and commercial properties with energy-efficient solutions.",
    },
  ];

  return (
    <section id="electrical" className="roofing" ref={projectsRef}>
      <div className="roofing-container">
        <div className={`roofing-header ${isVisible ? "animate" : ""}`}>
          <div className="breadcrumb">
            <span onClick={() => navigate("/services")} className="breadcrumb-link">Services</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Electrical</span>
          </div>
          <div className="section-label">Electrical Services</div>
          <h2>Professional Electrical Solutions</h2>
          <p>
            Expert electrical services for residential and commercial properties.
            From panel upgrades to smart home integration, we deliver
            safe and reliable electrical solutions with certified expertise.
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
            <h3>Ready to Upgrade Your Electrical System?</h3>
            <p>
              Join hundreds of satisfied customers who trust us with their
              electrical needs
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

export default ServiceElectrical;