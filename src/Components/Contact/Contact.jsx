import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css"; // Use 'style.css' for basic style or another theme
import "./Contact.scss";

const Contact = () => {
  const [phone, setPhone] = useState("");

  return (
    <div className="contact-container">
      <div className="contact-header">
        <div className="section-label">Contact Us</div>
        <h2>Get in Touch</h2>
        <p>
          We're here to answer your questions and help you with your roofing
          needs.
        </p>

        <div className="form">
          <div className="left">
            <h3>Contact Us</h3>
            <p>
              Let us know how we can help. Fill out the form and we’ll get back
              to you as soon as possible.
            </p>
          </div>

          <div className="right">
            <form
              action="https://formspree.io/f/YOUR_FORM_ID"
              method="POST"
              className="contact-form"
            >
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input type="text" id="address" name="address" required />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <PhoneInput
                  className="phone-input"
                  country={"us"} // Default country (e.g., Pakistan)
                  enableSearch
                  value={phone}
                  onChange={setPhone}
                  inputProps={{
                    name: "phone",
                    required: true,
                  }}
                />
              </div>

              {/* Hidden input to send actual phone value */}
              <input type="hidden" name="phone" value={phone} />

              <div className="form-group">
                <label htmlFor="message">Message (optional)</label>
                <textarea id="message" name="message" rows="5" />
              </div>

              <button type="submit" className="submit-button">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
