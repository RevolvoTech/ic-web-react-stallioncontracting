import React, { useState, useEffect, useRef } from "react";
import "./About.scss";

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const aboutRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px 0px -50px 0px",
      }
    );

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    // Fallback timeout to ensure visibility on mobile devices
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => {
      if (aboutRef.current) {
        observer.unobserve(aboutRef.current);
      }
      clearTimeout(fallbackTimer);
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

  const handleContactClick = () => {
    smoothScrollTo("contact");
  };

  

  const achievements = [
    {
      icon: "verified",
      title: "Licensed & Insured",
      description:
        "Fully licensed contractors with comprehensive insurance coverage",
    },
    {
      icon: "eco",
      title: "Eco-Friendly Solutions",
      description:
        "Sustainable roofing materials and energy-efficient installations",
    },
    {
      icon: "schedule",
      title: "24/7 Emergency Service",
      description:
        "Round-the-clock emergency response for urgent roofing issues",
    },
    {
      icon: "verified",
      title: "Extended Warranties",
      description: "Industry-leading warranty coverage on all our roofing work",
    },
  ];

  return (
    <section id="about" className="about" ref={aboutRef}>
      <div className="about-container">
        <div className={`about-header ${isVisible ? "animate" : ""}`}>
          <div className="section-label">About Us</div>
          <h2>Roofing Excellence Since 2008</h2>
          <p>
            Your trusted local roofing experts committed to protecting what
            matters most
          </p>
        </div>

        <div className="about-content">
          <div className="about-grid">
            <div className={`about-story ${isVisible ? "animate" : ""}`}>
              <div className="story-content">
                <h3>Our Story</h3>
                <p>
                  Founded in 2008, Zenith Roofing has been serving our community
                  with unwavering commitment to quality and integrity. What
                  started as a small family business has grown into the region's
                  most trusted roofing company, completing over 500 successful
                  projects.
                </p>
                <p>
                  We believe that every roof tells a story of protection,
                  durability, and craftsmanship. Our team of certified
                  professionals combines traditional techniques with modern
                  innovations to deliver roofing solutions that stand the test
                  of time.
                </p>

                <div className="story-highlights">
                  <div className="highlight">
                    <span className="material-icons">home_work</span>
                    <div>
                      <h4>500+ Projects</h4>
                      <p>Successfully completed</p>
                    </div>
                  </div>
                  <div className="highlight">
                    <span className="material-icons">groups</span>
                    <div>
                      <h4>15+ Team Members</h4>
                      <p>Certified professionals</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`about-map-section ${isVisible ? "animate" : ""}`}>
              <h3>Find Us</h3>
              <div className="map-container">
                <div className="map-placeholder">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345093747!2d144.9537353153167!3d-37.81720997975195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d43f3f5eb49%3A0x40579a430a0e620!2sQueen%20Victoria%20Market!5e0!3m2!1sen!2sau!4v1635820159831!5m2!1sen!2sau"
                    width="100%"
                    height="300"
                    style={{ border: 0, borderRadius: "12px" }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Zenith Roofing Location"
                  ></iframe>
                </div>
                <div className="contact-info">
                  <div className="contact-item">
                    <span className="material-icons">place</span>
                    <div>
                      <h4>Address</h4>
                      <p>
                        195 West 170 North
                        <br />
                        Orem, Utah 84057
                      </p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="material-icons">phone</span>
                    <div>
                      <h4>Phone</h4>
                      <p>801-800-5311</p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="material-icons">schedule</span>
                    <div>
                      <h4>Hours</h4>
                      <p>
                        Mon-Fri: 7AM-6PM
                        <br />
                        Emergency: 24/7
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`achievements-section ${isVisible ? "animate" : ""}`}>
            <h3>Why Choose Zenith Roofing</h3>
            <div className="achievements-grid">
              {achievements.map((achievement, index) => (
                <div
                  key={achievement.title}
                  className="achievement-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="achievement-icon">
                    <span className="material-icons">{achievement.icon}</span>
                  </div>
                  <div className="achievement-content">
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          

          <div className={`cta-section ${isVisible ? "animate" : ""}`}>
            <div className="cta-content">
              <h3>Ready to Get Started?</h3>
              <p>
                Contact us today for a free estimate and experience the Zenith
                difference
              </p>
              <div className="cta-buttons">
                <button className="cta-primary" onClick={handleContactClick}>
                  Free Estimate
                  <span className="material-icons">arrow_forward</span>
                </button>
                <button className="cta-secondary" onClick={handleContactClick}>
                  <span className="material-icons">phone</span>
                  Call Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
