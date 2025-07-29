import React, { useState, useEffect } from "react";
import "./Navbar.scss";
import logo from "../../assets/logo-horse.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const [showQuoteOnMobile, setShowQuoteOnMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const isMobile = window.innerWidth <= 768;
      const heroSection = document.getElementById('home');
      const heroHeight = heroSection ? heroSection.offsetHeight : 600;
      
      // Don't change navbar styling on mobile when quote button should show
      if (isMobile && scrollY > 700) {
        setScrolled(false); // Keep original navbar styling
      } else if (scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      // Show quote button on mobile when scrolled down enough
      if (isMobile && scrollY > 700) {
        setShowQuoteOnMobile(true);
      } else {
        setShowQuoteOnMobile(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const smoothScrollTo = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleLinkClick = (link, event) => {
    event.preventDefault();
    setActiveLink(link);
    setIsMenuOpen(false); // Close menu on link click
    smoothScrollTo(link);
  };

  const handleQuoteClick = () => {
    setActiveLink("contact");
    setIsMenuOpen(false);
    smoothScrollTo("contact");
  };

  return (
    <div className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo - hidden when quote button shows on mobile */}
        <div className={`navbar-logo ${showQuoteOnMobile ? "hide-mobile" : ""}`}>
          <a href="#home" onClick={(e) => handleLinkClick("home", e)}>
            <img src={logo} alt="Stallion Contracting" />
            Stallion Contracting
          </a>
        </div>
        
        {/* Centered Quote Button for Mobile */}
        <div className={`navbar-quote-center ${showQuoteOnMobile ? "show" : ""}`}>
          <button className="quote-btn-center" onClick={handleQuoteClick}>
            GET YOUR QUOTE
          </button>
        </div>

        <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <a
            href="#home"
            className={activeLink === "home" ? "active" : ""}
            onClick={(e) => handleLinkClick("home", e)}
          >
            Home
          </a>
          <a
            href="#services"
            className={activeLink === "services" ? "active" : ""}
            onClick={(e) => handleLinkClick("services", e)}
          >
            Services
          </a>
          <a
            href="#projects"
            className={activeLink === "projects" ? "active" : ""}
            onClick={(e) => handleLinkClick("projects", e)}
          >
            Projects
          </a>
          <a
            href="#testimonials"
            className={activeLink === "testimonials" ? "active" : ""}
            onClick={(e) => handleLinkClick("testimonials", e)}
          >
            Testimonials
          </a>
          <a
            href="#about"
            className={activeLink === "about" ? "active" : ""}
            onClick={(e) => handleLinkClick("about", e)}
          >
            About Us
          </a>
          <a
            href="#contact"
            className={activeLink === "contact" ? "active" : ""}
            onClick={(e) => handleLinkClick("contact", e)}
          >
            Contact
          </a>
        </div>

        <div className="navbar-quote">
          <button className="quote-btn" onClick={handleQuoteClick}>
            GET YOUR QUOTE
          </button>
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
