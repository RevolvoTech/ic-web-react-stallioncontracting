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
    navigate("/contact");
  };

  const handleServiceClick = (serviceTitle) => {
    const serviceMap = {
      "Roofing": "roofing",
      "Electrical": "electrical",
      "HVAC": "hvac", 
      "Plumbing": "plumbing",
      "Framing": "framing",
      "Concrete": "concrete",
      "Drywall": "drywall",
      "More": "more"
    };
    
    const categoryKey = serviceMap[serviceTitle];
    if (categoryKey) {
      navigate(`/services/${categoryKey}`);
    } else {
      navigate("/services");
    }
  };

  const services = [
    {
      id: 1,
      title: "Roofing",
      description:
        "Durable roofing solutions, including repairs and new installations to protect your property from the elements.",
      icon: "roofing",
    },
    {
      id: 2,
      title: "Electrical",
      description:
        "Custom electrical solutions, including wiring, panel upgrades, and lighting installation for both residential and commercial properties.",
      icon: "electrical_services",
    },
    {
      id: 3,
      title: "HVAC",
      description:
        "Expert HVAC services, including installation, maintenance, and repair to ensure your comfort in all seasons.",
      icon: "hvac",
    },
    {
      id: 4,
      title: "Plumbing",
      description:
        "Comprehensive plumbing services, from fixing leaks to full-scale installations for kitchens and bathrooms.",
      icon: "plumbing",
    },
    {
      id: 5,
      title: "Framing",
      description:
        "High-quality framing for new constructions and remodeling projects, ensuring a solid structure for your building.",
      icon: "construction",
    },
    {
      id: 6,
      title: "Concrete",
      description:
        "Professional concrete work for foundations, driveways, and patios, providing a long-lasting and stable base.",
      icon: "foundation",
    },
    {
      id: 7,
      title: "Drywall",
      description:
        "Seamless drywall installation and repair for a flawless finish in your home or office.",
      icon: "check_box_outline_blank",
    },
    {
      id: 8,
      title: "More",
      description:
        "Additional specialized services including flooring, painting, landscaping, and custom solutions tailored to your specific project needs.",
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
            At Stallion Contracting, we specialize in custom remodeling,
            restoring, fixing, and developing residential and commercial
            properties.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`service-card ${isVisible ? "animate" : ""}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleServiceClick(service.title)}
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

      </div>
    </section>
  );
};

export default Services;
