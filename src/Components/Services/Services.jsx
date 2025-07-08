import React, { useState, useEffect, useRef } from "react";
import "./Services.scss";

const Services = () => {
  const [isVisible, setIsVisible] = useState(false);
  const servicesRef = useRef(null);

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

  const services = [
    {
      id: 1,
      title: "Residential Roofing",
      description:
        "Expert installation and replacement of residential roofing systems. We work with asphalt shingles, metal roofing, tile, and slate to protect your home with durable, weather-resistant solutions.",
      icon: "home",
    },
    {
      id: 2,
      title: "Commercial Roofing",
      description:
        "Professional commercial roofing services for businesses and industrial facilities. Specializing in flat roofs, membrane systems, and large-scale installations with minimal business disruption.",
      icon: "business",
    },
    {
      id: 3,
      title: "Emergency Repairs",
      description:
        "24/7 emergency roofing services for storm damage, leaks, and urgent repairs. Our rapid response team provides immediate solutions to protect your property from further damage.",
      icon: "emergency",
    },
    {
      id: 4,
      title: "Roof Maintenance",
      description:
        "Comprehensive maintenance programs to extend your roof's lifespan. Regular inspections, cleaning, minor repairs, and preventive care to avoid costly replacements.",
      icon: "tune",
    },
    {
      id: 5,
      title: "Gutter Services",
      description:
        "Complete gutter installation, repair, and cleaning services. Protect your foundation with properly functioning gutters and downspouts designed for your specific roofing system.",
      icon: "water_drop",
    },
    {
      id: 6,
      title: "Roof Inspections",
      description:
        "Thorough roof inspections using advanced techniques and equipment. Detailed reports with photographic evidence and recommendations for maintenance or repairs.",
      icon: "search",
    },
  ];

  return (
    <section id="services" className="services" ref={servicesRef}>
      <div className="services-container">
        <div className={`services-header ${isVisible ? "animate" : ""}`}>
          <div className="section-label">Services</div>
          <h2>Complete Roofing Solutions</h2>
          <p>
            Professional roofing services for residential and commercial
            properties with over 20 years of experience
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`service-card ${isVisible ? "animate" : ""}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="service-icon">
                <span className="material-icons">{service.icon}</span>
              </div>
              <div className="service-content">
                <h3>{service.title}</h3>
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
            <h3>Ready to Get Started?</h3>
            <p>Contact us today for a free consultation and quote</p>
          </div>
          <button className="cta-button">Get Free Quote</button>
        </div>
      </div>
    </section>
  );
};

export default Services;
