import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Services.scss";

const Services = () => {
  const [isVisible, setIsVisible] = useState(false);
  const servicesRef = useRef(null);
  const navigate = useNavigate();

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

    if (servicesRef.current) {
      observer.observe(servicesRef.current);
    }

    return () => {
      if (servicesRef.current) {
        observer.unobserve(servicesRef.current);
      }
    };
  }, []);

  const handleQuoteClick = () => {
    navigate("/contact");
  };

  const serviceCategories = [
    { key: "roofing", label: "Roofing", icon: "roofing", description: "Complete roofing solutions for residential and commercial properties" },
    { key: "electrical", label: "Electrical", icon: "electrical_services", description: "Professional electrical services and installations" },
    { key: "hvac", label: "HVAC", icon: "hvac", description: "Heating, ventilation, and air conditioning systems" },
    { key: "plumbing", label: "Plumbing", icon: "plumbing", description: "Comprehensive plumbing services and repairs" },
    { key: "framing", label: "Framing", icon: "construction", description: "Structural framing for construction projects" },
    { key: "concrete", label: "Concrete", icon: "foundation", description: "Concrete work and foundation services" },
    { key: "drywall", label: "Drywall", icon: "check_box_outline_blank", description: "Drywall installation and finishing" },
    { key: "more", label: "More Services", icon: "layers", description: "Additional specialized construction services" },
  ];

  const handleServiceClick = (serviceKey) => {
    navigate(`/services/${serviceKey}`);
  };

  return (
    <div className="services-page">
      <section className="services" ref={servicesRef}>
        <div className="services-container">
          <div className={`services-header ${isVisible ? "animate" : ""}`}>
            <div className="section-label">Services</div>
            <h1>Our Expertise</h1>
            <p>
              Comprehensive construction and contracting services for all your residential 
              and commercial needs. From electrical to concrete, we've got you covered.
            </p>
          </div>

          <div className="services-grid">
            {serviceCategories.map((category, index) => (
              <div
                key={category.key}
                className={`service-card ${isVisible ? "animate" : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleServiceClick(category.key)}
              >
                <div className="service-icon">
                  <span className="material-icons">{category.icon}</span>
                </div>
                <div className="service-content">
                  <h3>{category.label}</h3>
                  <p>{category.description}</p>
                </div>
                <div className="service-arrow">
                  <span className="material-icons">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>

          <div className={`services-cta ${isVisible ? "animate" : ""}`}>
            <div className="cta-content">
              <h3>Ready to Get Started?</h3>
              <p>Contact us today for a free consultation and quote on your project.</p>
            </div>
            <button className="cta-button" onClick={handleQuoteClick}>
              Get Your Free Quote
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;