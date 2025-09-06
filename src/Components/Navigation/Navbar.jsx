import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.scss";
import logo from "../../assets/logo.svg";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const [showQuoteOnMobile, setShowQuoteOnMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const isMobile = window.innerWidth <= 768;
      const heroSection = document.getElementById('home');
      const heroHeight = heroSection ? heroSection.offsetHeight : 600;
      
      // If not on home page, always show dark background
      if (location.pathname !== '/') {
        setScrolled(true);
      } else {
        // Home page behavior - simple scroll behavior for consistent styling
        if (scrollY > 50) {
          setScrolled(true);
        } else {
          setScrolled(false);
        }
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
  }, [location.pathname]); // Added location.pathname as dependency

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

  const handleLinkClick = (link, event, isRoute = false) => {
    event.preventDefault();
    setActiveLink(link);
    setIsMenuOpen(false); // Close menu on link click
    
    if (isRoute) {
      // Navigate to different page
      navigate(link);
    } else {
      // Same page scrolling - ensure we're on home page first
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation then scroll
        setTimeout(() => smoothScrollTo(link), 100);
      } else {
        smoothScrollTo(link);
      }
    }
  };

  const handleQuoteClick = () => {
    setIsMenuOpen(false);
    navigate("/contact");
  };

  return (
    <div className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo - hidden when quote button shows on mobile */}
        <div className={`navbar-logo ${showQuoteOnMobile ? "hide-mobile" : ""}`}>
          <Link to="/" onClick={() => { setActiveLink("home"); setIsMenuOpen(false); }}>
            <img src={logo} alt="Logo" />
          </Link>
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
            href="/services"
            className={location.pathname === "/services" || location.pathname.startsWith("/services") ? "active" : ""}
            onClick={(e) => handleLinkClick("/services", e, true)}
          >
            Services
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
            href="/contact"
            className={location.pathname === "/contact" ? "active" : ""}
            onClick={(e) => handleLinkClick("/contact", e, true)}
          >
            Contact Us
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
