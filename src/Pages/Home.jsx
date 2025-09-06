import React, { useState, useEffect } from "react";
import Header from "../Components/Header/Header";
import Services from "../Components/Services/Services";
import About from "../Components/About/About";
import Testimonials from "../Components/Testimonials/Testimonials";
import Gallery from "../Components/Gallery/Gallery";
import "./Home.scss";

const Home = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const isMobile = window.innerWidth <= 768;
      
      // Show scroll-to-top button when mobile quote button is visible
      if (isMobile && scrollY > 700) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll); // Handle screen resize

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <>
      <Header />
      <Services />
      <Gallery />
      <Testimonials />
      <About />
      
      {/* Scroll to top button - only visible when mobile quote button shows */}
      <button 
        className={`scroll-to-top ${showScrollTop ? "visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <span className="material-icons">keyboard_arrow_up</span>
      </button>
    </>
  );
};

export default Home;