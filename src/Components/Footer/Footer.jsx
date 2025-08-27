import React from "react";
import "./Footer.scss";
import logo from "../../assets/logo.svg";
import revolvoLogo from "../../assets/revolvo_logo.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section footer-brand">
            <img src={logo} alt="Stallion Contracting" className="footer-logo" />
            <p>
              Professional roofing solutions with over 20 years of experience.
              Your trusted partner for all residential and commercial roofing
              needs.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">
                <span className="material-icons">language</span>
              </a>
              <a href="#" aria-label="Twitter">
                <span className="material-icons">alternate_email</span>
              </a>
              <a href="#" aria-label="Instagram">
                <span className="material-icons">camera_alt</span>
              </a>
              <a href="#" aria-label="LinkedIn">
                <span className="material-icons">work</span>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li>
                <a href="#services">Residential Roofing</a>
              </li>
              <li>
                <a href="#services">Commercial Roofing</a>
              </li>
              <li>
                <a href="#services">Emergency Repairs</a>
              </li>
              <li>
                <a href="#services">Roof Maintenance</a>
              </li>
              <li>
                <a href="#services">Gutter Services</a>
              </li>
              <li>
                <a href="#services">Roof Inspections</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li>
                <a href="#about">About Us</a>
              </li>
              <li>
                <a href="#projects">Our Projects</a>
              </li>
              <li>
                <a href="#testimonials">Testimonials</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
              <li>
                <a href="#careers">Careers</a>
              </li>
              <li>
                <a href="#warranty">Warranty</a>
              </li>
            </ul>
          </div>

          <div className="footer-section footer-contact">
            <h4>Contact Info</h4>
            <div className="contact-item">
              <span className="material-icons">phone</span>
              <div>
                <p>801-800-5311</p>
                <p>Phone number</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="material-icons">email</span>
              <div>
                <p>info@stallioncontractingut.com</p>
                <p>Email address</p>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-legal">
              <p>&copy; {new Date().getFullYear()} Stallion Contracting. All rights reserved.</p>
              <div className="footer-links">
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Service</a>
                <a href="#sitemap">Sitemap</a>
              </div>
            </div>
            <div className="footer-certifications">
              <p>Licensed • Bonded • Insured</p>
              <p>License #ROF-2024-001</p>
            </div>
          </div>
          <div className="footer-powered-by">
            <span>Developed by</span>
            <a 
              href="https://revolvo.tech" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Revolvo Tech - Web Development Agency"
              title="See more of our work"
            >
              <span>Revolvo Tech</span>
              <img src={revolvoLogo} alt="Revolvo Tech Web Design & Development Logo" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
