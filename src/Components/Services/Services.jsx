import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Services.scss";
import { primaryServices } from "../../content/siteContent";

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

  const handleServiceClick = (serviceKey) => {
    navigate(`/services#${serviceKey}`);
  };

  return (
    <section id="services" className="services" ref={servicesRef}>
      <div className="services-container">
        <div className={`services-header ${isVisible ? "animate" : ""}`}>
          <div className="section-label">Services</div>
          <h2>Roofing, Concrete, And Basement Projects</h2>
          <p>
            Stallion Contracting focuses on practical project work for homes
            and properties across the Wasatch Valley, with clear estimates,
            responsive communication, and dependable craftsmanship.
          </p>
        </div>

        <div className="services-grid">
          {primaryServices.map((service, index) => (
            <div
              key={service.key}
              className={`service-card ${isVisible ? "animate" : ""}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleServiceClick(service.key)}
            >
              <div className="service-icon">
                <span className="material-icons">{service.icon}</span>
              </div>
              <div className="service-content">
                <h3>{service.label}</h3>
                <p>{service.description}</p>
              </div>
              <div className="service-arrow">
                <span className="material-icons">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>

        <div className={`services-cta ${isVisible ? "animate" : ""}`}>
          <div className="cta-content">
            <h3>Need A Project Estimate?</h3>
            <p>
              Tell us about your property, service address, and scope, and we
              will follow up with the right next step.
            </p>
          </div>
          <button className="cta-button" onClick={handleQuoteClick}>
            Get Your Free Quote
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;
