import React from "react";
import { Link } from "react-router-dom";
import "../Components/LegalPage/LegalPage.scss";

const sitemapSections = [
  {
    title: "Main Pages",
    links: [
      { label: "Home", to: "/" },
      { label: "Services Overview", to: "/services" },
      { label: "Contact Us", to: "/contact" },
    ],
  },
  {
    title: "Service Pages",
    links: [
      { label: "Roofing", to: "/services/roofing" },
      { label: "Electrical", to: "/services/electrical" },
      { label: "HVAC", to: "/services/hvac" },
      { label: "Plumbing", to: "/services/plumbing" },
      { label: "Framing", to: "/services/framing" },
      { label: "Concrete", to: "/services/concrete" },
      { label: "Drywall", to: "/services/drywall" },
      { label: "More Services", to: "/services/more" },
    ],
  },
  {
    title: "Legal Pages",
    links: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms of Service", to: "/terms-of-service" },
      { label: "SMS Terms", to: "/sms-terms" },
      { label: "XML Sitemap", href: "/sitemap.xml" },
    ],
  },
];

const Sitemap = () => {
  return (
    <div className="legal-page">
      <section className="legal-hero">
        <div className="legal-container">
          <div className="section-label">Sitemap</div>
          <h1>Browse The Website</h1>
          <p>
            Use this page to quickly navigate the main Stallion Contracting
            pages, service pages, and legal information.
          </p>
          <div className="legal-meta">Updated Website Links</div>
        </div>
      </section>

      <section className="legal-content">
        <div className="legal-container">
          {sitemapSections.map((section) => (
            <div key={section.title} className="legal-section">
              <h2>{section.title}</h2>
              <ul className="legal-list">
                {section.links.map((item) => (
                  <li key={item.label}>
                    {item.to ? (
                      <Link to={item.to}>{item.label}</Link>
                    ) : (
                      <a href={item.href}>{item.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="legal-cta">
        <div className="legal-container">
          <div className="legal-cta-card">
            <h2>Need Help With A Project?</h2>
            <p>
              Reach out to Stallion Contracting for quotes, service questions,
              or help finding the right page.
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

export default Sitemap;
