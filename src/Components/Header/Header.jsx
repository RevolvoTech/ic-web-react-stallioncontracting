import React from "react";
import "./Header.scss";
import bgVideo from "../../assets/Videos/0708.mp4";
const Header = () => {
  return (
    <header id="home" className="header">
      <video className="bg-video" autoPlay loop muted playsInline>
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="header-content">
        <h1>Quality Roofing Solutions</h1>
        <p>Professional Roof Installation, Repair & Maintenance Services</p>
        <div className="header-buttons">
          <button className="btn btn-primary">Free Estimate</button>
          <button className="btn btn-secondary">Our Services</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
