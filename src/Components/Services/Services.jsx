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

  const smoothScrollTo = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleQuoteClick = () => {
    smoothScrollTo("contact");
  };

  const services = [
    {
      id: 1,
      title: "Electrical",
      description: "Custom electrical solutions, including wiring, panel upgrades, and lighting installation for both residential and commercial properties.",
      icon: "electrical_services",
    },
    {
      id: 2,
      title: "HVAC",
      description: "Expert HVAC services, including installation, maintenance, and repair to ensure your comfort in all seasons.",
      icon: "hvac",
    },
    {
      id: 3,
      title: "Plumbing",
      description: "Comprehensive plumbing services, from fixing leaks to full-scale installations for kitchens and bathrooms.",
      icon: "plumbing",
    },
    {
      id: 4,
      title: "Framing",
      description: "High-quality framing for new constructions and remodeling projects, ensuring a solid structure for your building.",
      icon: "construction",
    },
    {
      id: 5,
      title: "Roofing",
      description: "Durable roofing solutions, including repairs and new installations to protect your property from the elements.",
      icon: "roofing",
    },
    {
      id: 6,
      title: "Concrete",
      description: "Professional concrete work for foundations, driveways, and patios, providing a long-lasting and stable base.",
      icon: "foundation",
    },
    {
        id: 7,
        title: "Drywall",
        description: "Seamless drywall installation and repair for a flawless finish in your home or office.",
        icon: "check_box_outline_blank",
      },
      {
        id: 8,
        title: "Flooring",
        description: "A wide range of flooring options and installation services to enhance the beauty and value of your space.",
        icon: "layers",
      },
  ];

  return (
    <section id="services" className="services" ref={servicesRef}>
      <div className="services-container">
        <div className={`services-header ${isVisible ? "animate" : ""}`}>
          <div className="section-label">Services</div>
          <h2>Our Expertise</h2>
          <p>
          At Stallion Contracting, we specialize in custom remodeling, restoring, fixing, and developing residential and commercial properties.
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
          <button className="cta-button" onClick={handleQuoteClick}>
            Get Free Quote
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;