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

  const handleCallClick = () => {
    window.location.href = "tel:801-800-5311";
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
      title: "Quality Materials",
      description:
        "Premium materials and energy-efficient solutions for all projects",
    },
  ];

  return (
    <section id="about" className="about" ref={aboutRef}>
      <div className="about-container">
        <div className={`about-header ${isVisible ? "animate" : ""}`}>
          <div className="section-label">About Us</div>
          <h2>Trusted for Results</h2>
          <h3>Delivering Contracting Excellence Since 1996</h3>
          <p>
            When it comes to your home or project, cutting corners isn't an option. That's why families and property owners across Utah turn to Stallion Contracting — a team with decades of hands-on experience, precision craftsmanship, and a reputation built on results.
          </p>
        </div>

        <div className="about-content">
          <div className="about-grid">
            <div className={`about-story ${isVisible ? "animate" : ""}`}>
              <div className="story-content">
                <h3>Our Story</h3>
                <p>
                  Stallion Contracting was officially founded in 2023, but our roots go back to 1996 — when our founder first stepped into the industry with a simple mission: Do it right, or don't do it at all.
                </p>
                <p>
                  What began as a small family operation has grown into one of Utah's most reliable and respected contracting teams — trusted by 305 homeowners, investors, and families (and counting). From roofing and remodeling to full-scale renovations, we've earned our reputation by showing up on time, staying on budget, and treating every project like it's our own home.
                </p>
                <p>
                  Because to us, it's never just construction —<br />
                  it's building trust.
                </p>

                <div className="story-highlights">
                  <div className="highlight">
                    <span className="material-icons">home_work</span>
                    <div>
                      <h4>305+ Projects</h4>
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

            <div className={`about-contact-section ${isVisible ? "animate" : ""}`}>
              <h3>Find Us</h3>
              <div className="contact-info">
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

          <div className={`achievements-section ${isVisible ? "animate" : ""}`}>
            <h3>Why Choose Stallion Contracting</h3>
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
              <h3>Get your quote at no cost today</h3>
              <div className="cta-buttons">
                <button className="cta-primary" onClick={handleContactClick}>
                  Get your Quote
                  <span className="material-icons">arrow_forward</span>
                </button>
                <button className="cta-secondary" onClick={handleCallClick}>
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
