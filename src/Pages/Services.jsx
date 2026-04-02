import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Services.scss";
import {
  primaryServices,
  serviceCoverage,
  serviceProcess,
} from "../content/siteContent";

const Services = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleQuoteClick = () => {
    navigate("/contact");
  };

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const targetId = location.hash.replace("#", "");

    window.setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);
  }, [location.hash]);

  return (
    <div className="services-page">
      <section className="services">
        <div className="services-container">
          <div className={`services-header ${isVisible ? "animate" : ""}`}>
            <div className="section-label">Services</div>
            <h1>Built For Roofing, Concrete, And Basement Work</h1>
            <p>
              Stallion Contracting serves property owners across the Wasatch
              Valley with focused project support, straightforward estimates,
              and consistent communication from quote to completion.
            </p>
          </div>

          <div className="services-grid">
            {primaryServices.map((service, index) => (
              <div
                key={service.key}
                id={service.key}
                className={`service-card ${isVisible ? "animate" : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="service-icon">
                  <span className="material-icons">{service.icon}</span>
                </div>
                <div className="service-content">
                  <h3>{service.label}</h3>
                  <p>{service.description}</p>
                  <ul className="service-highlights">
                    {service.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className={`services-coverage ${isVisible ? "animate" : ""}`}>
            {serviceCoverage.map((item) => (
              <div key={item} className="coverage-item">
                <span className="material-icons">check_circle</span>
                <p>{item}</p>
              </div>
            ))}
          </div>

          <div className={`services-process ${isVisible ? "animate" : ""}`}>
            <div className="process-header">
              <h2>What To Expect</h2>
              <p>
                Our process is built to keep estimate requests, scheduling, and
                project communication clear from the start.
              </p>
            </div>

            <div className="process-grid">
              {serviceProcess.map((step, index) => (
                <div key={step.title} className="process-card">
                  <div className="process-number">0{index + 1}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`services-cta ${isVisible ? "animate" : ""}`}>
            <div className="cta-content">
              <h3>Ready To Talk Through Your Project?</h3>
              <p>
                Contact us today for a quote request, on-site consultation, or
                project update.
              </p>
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
