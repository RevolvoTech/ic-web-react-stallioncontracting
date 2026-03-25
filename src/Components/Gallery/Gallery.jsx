import React, { useState, useEffect, useRef } from "react";
import "./Gallery.scss";

import PresidentialClose from "../../assets/img/services/roofing/presidential-shingles-close.jpg";
import PresidentialFar from "../../assets/img/services/roofing/presidential-shingles-far.jpg";
import TPOClose from "../../assets/img/services/roofing/tpo-close.jpg";
import TPOFar from "../../assets/img/services/roofing/tpo-far.jpg";
import CedarClose from "../../assets/img/services/roofing/cedar-shake-close.jpg";
import CedarFar from "../../assets/img/services/roofing/cedar-shake-far.jpg";

const Gallery = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [sliderPositions, setSliderPositions] = useState({});
  const galleryRef = useRef(null);
  const sliderRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.2,
      }
    );

    if (galleryRef.current) {
      observer.observe(galleryRef.current);
    }

    return () => {
      if (galleryRef.current) {
        observer.unobserve(galleryRef.current);
      }
    };
  }, []);

  const projects = [
    {
      id: 1,
      title: "Presidential Shingles",
      beforeImage: PresidentialClose,
      afterImage: PresidentialFar,
      description: "High-quality presidential shingles offering superior durability and aesthetic appeal with a lifetime warranty.",
    },
    {
      id: 2,
      title: "TPO Roofing",
      beforeImage: TPOClose,
      afterImage: TPOFar,
      description: "Energy-efficient TPO roofing system ideal for commercial and flat roof applications with excellent weather resistance.",
    },
    {
      id: 3,
      title: "Cedar Shake",
      beforeImage: CedarClose,
      afterImage: CedarFar,
      description: "Authentic cedar shake roofing providing natural beauty and excellent insulation properties for traditional homes.",
    },
  ];

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

    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);

    if (event.touches && event.touches[0]) {
      const touchEvent = {
        clientX: event.touches[0].clientX,
      };
      handleSliderMove(projectId, touchEvent, true);
    }
  };

  return (
    <section id="gallery" className="gallery" ref={galleryRef}>
      <div className="gallery-container">
        <div className={`gallery-header ${isVisible ? "animate" : ""}`}>
          <div className="section-label">Our Work</div>
          <h2>Project Gallery</h2>
          <p>
            See our quality craftsmanship in action with these before and after transformations
          </p>
        </div>

        <div className="gallery-grid">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`gallery-project ${isVisible ? "animate" : ""}`}
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
              <div className="project-info">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;