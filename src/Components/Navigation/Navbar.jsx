import React, { useState, useEffect } from "react";
import "./Navbar.scss";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = (link) => {
    setActiveLink(link);
    setIsMenuOpen(false); // Close menu on link click
  };

  return (
    <div className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <a href="#home" onClick={() => handleLinkClick("home")}>
            <img src={logo} alt="Stallion Contracting" />
            Stallion Contracting
          </a>
        </div>

        <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <a
            href="#home"
            className={activeLink === "home" ? "active" : ""}
            onClick={() => handleLinkClick("home")}
          >
            Home
          </a>
          <a
            href="#services"
            className={activeLink === "services" ? "active" : ""}
            onClick={() => handleLinkClick("services")}
          >
            Services
          </a>
          <a
            href="#projects"
            className={activeLink === "projects" ? "active" : ""}
            onClick={() => handleLinkClick("projects")}
          >
            Projects
          </a>
          <a
            href="#testimonials"
            className={activeLink === "testimonials" ? "active" : ""}
            onClick={() => handleLinkClick("testimonials")}
          >
            Testimonials
          </a>
          <a
            href="#about"
            className={activeLink === "about" ? "active" : ""}
            onClick={() => handleLinkClick("about")}
          >
            About Us
          </a>
          <a
            href="#contact"
            className={activeLink === "contact" ? "active" : ""}
            onClick={() => handleLinkClick("contact")}
          >
            Contact
          </a>
        </div>

        <div className="navbar-quote">
          <button className="quote-btn">Get a Free Quote</button>
        </div>

        <div
          className={`navbar-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
