import React, { useState, useEffect, useRef } from "react";
import "./Projects.scss";
import Before1 from "../../assets/img/before-1.jpg";
import After1 from "../../assets/img/after-1.jpg";
import Before2 from "../../assets/img/before-2.jpg";
import After2 from "../../assets/img/after-2.jpg";
import Before3 from "../../assets/img/before-3.jpg";
import After3 from "../../assets/img/after-3.jpg";
import video from "../../assets/img/video.mp4";

const Projects = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  const [sliderPositions, setSliderPositions] = useState({});
  const projectsRef = useRef(null);
  const sliderRefs = useRef({});

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
    smoothScrollTo("contact");
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

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
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
      title: "Kitchen Renovation & Remodeling",
      location: "Residential Project",
      type: "Complete Remodel",
      beforeImage: Before1, // This will be replaced with kitchen photo when provided
      afterImage: After1,
      description:
        "Complete kitchen transformation with modern fixtures, custom cabinetry, and premium countertops for enhanced functionality and style.",
    },
    {
      id: 2,
      title: "Bathroom Renovation",
      location: "Master Suite",
      type: "Full Renovation",
      beforeImage: Before2,
      afterImage: After2,
      description:
        "Luxury bathroom renovation featuring modern tile work, custom vanities, and premium fixtures for a spa-like experience.",
    },
    {
      id: 3,
      title: "Home Addition & Extension",
      location: "Family Home",
      type: "Construction",
      beforeImage: Before3,
      afterImage: After3,
      description:
        "Seamless home addition providing extra living space while maintaining architectural integrity and enhancing property value.",
    },
  ];

  return (
    <section id="projects" className="projects" ref={projectsRef}>
      <div className="projects-container">
        <div className={`projects-header ${isVisible ? "animate" : ""}`}>
          <div className="section-label">Our Work</div>
          <h2>Recent Projects</h2>
          <p>
            Diverse contracting solutions from kitchen remodels to home additions.
            See the quality craftsmanship and attention to detail in every project.
          </p>
        </div>

        <div className="projects-grid">
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
                      src={project.afterImage}
                      alt={`${project.title} - After`}
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
                      src={project.beforeImage}
                      alt={`${project.title} - Before`}
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
                    <span className="project-location">
                      <span className="material-icons">place</span>
                      {project.location}
                    </span>
                  </div>
                  <h3>{project.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={`projects-cta ${isVisible ? "animate" : ""}`}>
          <div className="cta-content">
            <h3>Ready to Transform Your Space?</h3>
            <p>
              Join hundreds of satisfied customers who trust us with their
              construction and renovation needs
            </p>
          </div>
          <button className="cta-button" onClick={handleProjectClick}>
            Get your free consultation
            <span className="material-icons">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Projects;
