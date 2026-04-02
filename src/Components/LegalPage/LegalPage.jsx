import React from "react";
import { Link } from "react-router-dom";
import "./LegalPage.scss";

const LegalPage = ({ eyebrow, title, effectiveDate, intro, children }) => {
  return (
    <div className="legal-page">
      <section className="legal-hero">
        <div className="legal-container">
          <div className="section-label">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{intro}</p>
          <div className="legal-meta">Effective Date: {effectiveDate}</div>
        </div>
      </section>

      <section className="legal-content">
        <div className="legal-container">{children}</div>
      </section>

      <section className="legal-cta">
        <div className="legal-container">
          <div className="legal-cta-card">
            <h2>Questions About Your Project Or These Terms?</h2>
            <p>
              Reach out to Stallion Contracting for project questions, quote
              requests, or help with privacy and SMS-related inquiries.
            </p>
            <div className="legal-cta-actions">
              <Link to="/contact" className="primary-link">
                Contact Us
              </Link>
              <Link to="/services" className="secondary-link">
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegalPage;
