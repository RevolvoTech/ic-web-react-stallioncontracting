import React, { useState, useEffect, useRef } from "react";
import "./Gallery.scss";

import after1 from "../../assets/img/after-1.jpg";
import after2 from "../../assets/img/after-2.jpg";
import after3 from "../../assets/img/after-3.jpg";
import before1 from "../../assets/img/before-1.jpg";
import before2 from "../../assets/img/before-2.jpg";
import before3 from "../../assets/img/before-3.jpg";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const galleryRef = useRef(null);

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
      src: after1,
      title: "Residential Roof Replacement",
      category: "residential",
      location: "Downtown District",
      type: "Asphalt Shingles",
      description:
        "Complete roof replacement with premium architectural shingles providing enhanced durability and weather protection.",
    },
    {
      id: 2,
      src: before1,
      title: "Historic Home Restoration",
      category: "residential",
      location: "Heritage District",
      type: "Cedar Shingles",
      description:
        "Careful restoration maintaining original character while improving structural integrity.",
    },
    {
      id: 3,
      src: after2,
      title: "Commercial Flat Roof",
      category: "commercial",
      location: "Business Park",
      type: "EPDM Membrane",
      description:
        "Professional commercial roof installation with energy-efficient membrane system and improved drainage.",
    },
    {
      id: 4,
      src: before2,
      title: "Industrial Complex",
      category: "commercial",
      location: "Industrial Zone",
      type: "Metal Roofing",
      description:
        "Large-scale industrial roofing project with durable metal roofing systems.",
    },
    {
      id: 5,
      src: after3,
      title: "Storm Damage Repair",
      category: "repair",
      location: "Suburban Area",
      type: "Emergency Repair",
      description:
        "Emergency response and complete roof reconstruction after severe storm damage.",
    },
    {
      id: 6,
      src: before3,
      title: "Roof Maintenance",
      category: "repair",
      location: "Residential Area",
      type: "Maintenance",
      description:
        "Comprehensive roof maintenance and repair services to extend roof lifespan.",
    },
  ];

  const filters = [
    { key: "all", label: "All Projects", icon: "grid_view" },
    { key: "residential", label: "Residential", icon: "home" },
    { key: "commercial", label: "Commercial", icon: "business" },
    { key: "repair", label: "Repairs", icon: "build" },
  ];

  const filteredProjects =
    activeFilter === "all"
      ? projects
      : projects.filter((project) => project.category === activeFilter);

  const openPopup = (project) => {
    setSelectedImage(project);
    const projectIndex = filteredProjects.findIndex((p) => p.id === project.id);
    setCurrentImageIndex(projectIndex);
  };

  const closePopup = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    const newIndex =
      direction === "next"
        ? (currentImageIndex + 1) % filteredProjects.length
        : (currentImageIndex - 1 + filteredProjects.length) %
          filteredProjects.length;

    setCurrentImageIndex(newIndex);
    setSelectedImage(filteredProjects[newIndex]);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedImage) return;

      switch (e.key) {
        case "Escape":
          closePopup();
          break;
        case "ArrowLeft":
          navigateImage("prev");
          break;
        case "ArrowRight":
          navigateImage("next");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [selectedImage, currentImageIndex, filteredProjects]);

  return (
    <section id="gallery" className="gallery" ref={galleryRef}>
      <div className="gallery-container">
        <div className={`gallery-header ${isVisible ? "animate" : ""}`}>
          <div className="section-label">Our Work</div>
          <h2>Project Gallery</h2>
          <p>
            Explore our portfolio of successful roofing projects and see the
            quality craftsmanship we deliver
          </p>
        </div>

        <div className={`gallery-filters ${isVisible ? "animate" : ""}`}>
          {filters.map((filter) => (
            <button
              key={filter.key}
              className={`filter-btn ${
                activeFilter === filter.key ? "active" : ""
              }`}
              onClick={() => setActiveFilter(filter.key)}
            >
              <span className="material-icons">{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>

        <div className="gallery-grid">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className={`gallery-project ${isVisible ? "animate" : ""}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => openPopup(project)}
            >
              <div className="project-image">
                <img src={project.src} alt={project.title} />
                <div className="image-overlay">
                  <div className="overlay-content">
                    <span className="material-icons">visibility</span>
                    <span className="view-text">View Project</span>
                  </div>
                </div>
              </div>
              <div className="project-info">
                <div className="project-meta">
                  <span className="project-type">{project.type}</span>
                  <span className="project-location">
                    <span className="material-icons">place</span>
                    {project.location}
                  </span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div className="popup" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={closePopup}>
              <span className="material-icons">close</span>
            </button>

            <button
              className="popup-nav prev"
              onClick={() => navigateImage("prev")}
            >
              <span className="material-icons">chevron_left</span>
            </button>

            <button
              className="popup-nav next"
              onClick={() => navigateImage("next")}
            >
              <span className="material-icons">chevron_right</span>
            </button>

            <div className="popup-image-container">
              <img src={selectedImage.src} alt={selectedImage.title} />

              <div className="popup-info">
                <div className="project-details">
                  <h3>{selectedImage.title}</h3>
                  <div className="project-meta">
                    <span className="project-type">{selectedImage.type}</span>
                    <span className="project-location">
                      <span className="material-icons">place</span>
                      {selectedImage.location}
                    </span>
                  </div>
                  <p>{selectedImage.description}</p>
                </div>
              </div>
            </div>

            <div className="popup-controls">
              <span className="popup-counter">
                {currentImageIndex + 1} / {filteredProjects.length}
              </span>
              <div className="popup-hints">
                <span>← → Navigate</span>
                <span>Esc: Close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
