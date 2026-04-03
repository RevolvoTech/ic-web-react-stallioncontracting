import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.scss";
import logo from "../../assets/logo.svg";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const [showQuoteOnMobile, setShowQuoteOnMobile] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const serviceLinks = [
    {
      label: "Roofing",
      path: "/services/roofing",
      icon: "roofing",
      description: "Repairs, replacement, and weather protection",
    },
    {
      label: "Electrical",
      path: "/services/electrical",
      icon: "electrical_services",
      description: "Panels, wiring, fixtures, and upgrades",
    },
    {
      label: "HVAC",
      path: "/services/hvac",
      icon: "hvac",
      description: "Heating and cooling system support",
    },
    {
      label: "Plumbing",
      path: "/services/plumbing",
      icon: "plumbing",
      description: "Repairs, installs, and system updates",
    },
    {
      label: "Framing",
      path: "/services/framing",
      icon: "construction",
      description: "Structural framing for new work and remodels",
    },
    {
      label: "Concrete",
      path: "/services/concrete",
      icon: "foundation",
      description: "Flatwork, pads, patios, and site pours",
    },
    {
      label: "Drywall",
      path: "/services/drywall",
      icon: "check_box_outline_blank",
      description: "Install, repair, and clean finishing work",
    },
    {
      label: "More Services",
      path: "/services/more",
      icon: "layers",
      description: "Additional specialty contracting solutions",
    },
  ];

  const isServicesRoute =
    location.pathname === "/services" ||
    location.pathname.startsWith("/services/");
  const isHomeActive = location.pathname === "/" && activeLink === "home";
  const isAboutActive = location.pathname === "/" && activeLink === "about";

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const isMobile = window.innerWidth <= 768;

      if (location.pathname !== "/") {
        setScrolled(true);
      } else {
        setScrolled(scrollY > 50);
      }

      setShowQuoteOnMobile(isMobile && scrollY > 700);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    setIsServicesOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen((current) => !current);
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
    setIsMenuOpen(false);
    setIsServicesOpen(false);

    if (isRoute) {
      navigate(link);
      return;
    }

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => smoothScrollTo(link), 100);
      return;
    }

    smoothScrollTo(link);
  };

  const handleQuoteClick = () => {
    setIsMenuOpen(false);
    setIsServicesOpen(false);
    navigate("/contact");
  };

  const handleServiceRouteClick = () => {
    setIsMenuOpen(false);
    setIsServicesOpen(false);
  };

  return (
    <div className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <div className={`navbar-logo ${showQuoteOnMobile ? "hide-mobile" : ""}`}>
          <Link
            to="/"
            onClick={() => {
              setActiveLink("home");
              setIsMenuOpen(false);
              setIsServicesOpen(false);
            }}
          >
            <img src={logo} alt="Logo" />
          </Link>
        </div>

        <div className={`navbar-quote-center ${showQuoteOnMobile ? "show" : ""}`}>
          <button className="quote-btn-center" onClick={handleQuoteClick}>
            GET YOUR QUOTE
          </button>
        </div>

        <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <a
            href="#home"
            className={isHomeActive ? "active" : ""}
            onClick={(e) => handleLinkClick("home", e)}
          >
            Home
          </a>

          <div
            className={`services-dropdown ${isServicesRoute ? "active" : ""} ${
              isServicesOpen || isMenuOpen ? "open" : ""
            }`}
            onMouseEnter={() => setIsServicesOpen(true)}
            onMouseLeave={() => setIsServicesOpen(false)}
          >
            <button
              type="button"
              className="services-trigger"
              aria-haspopup="true"
              aria-expanded={isServicesOpen || isMenuOpen ? "true" : "false"}
            >
              Services
              <span className="material-icons">expand_more</span>
            </button>

            <div className="services-dropdown-menu">
              <div className="services-menu-header">
                <span className="services-menu-eyebrow">Explore Services</span>
                <p>
                  Browse the core contracting work Stallion handles across
                  residential and commercial projects.
                </p>
              </div>

              <div className="services-menu-grid">
                {serviceLinks.map((service) => (
                  <Link
                    key={service.path}
                    to={service.path}
                    className={`services-menu-link ${
                      location.pathname === service.path ? "active" : ""
                    }`}
                    onClick={handleServiceRouteClick}
                  >
                    <span className="service-icon-wrap">
                      <span className="material-icons">{service.icon}</span>
                    </span>
                    <span className="service-copy">
                      <strong>{service.label}</strong>
                      <small>{service.description}</small>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <a
            href="#about"
            className={isAboutActive ? "active" : ""}
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
