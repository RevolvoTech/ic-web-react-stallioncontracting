import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css"; // Use 'style.css' for basic style or another theme
import "./Contact.scss";

const Contact = () => {
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const formData = new FormData(e.target);
    formData.append("phone", phone);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: formData.get("access_key"),
          name: formData.get("name"),
          email: formData.get("email"),
          address: formData.get("address"),
          phone: phone,
          message: formData.get("message"),
          subject: formData.get("subject"),
          from_name: formData.get("from_name"),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus("success");
        e.target.reset();
        setPhone("");
      } else {
        console.error("Web3Forms error:", result);
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="contact" className="contact-container">
      <div className="contact-header">
        <div className="section-label">Contact Us</div>
        <h2>Get in Touch</h2>
        <p>
          We're here to answer your questions and help you with your contracting
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
            <form onSubmit={handleSubmit} className="contact-form">
              {/* Web3Forms Access Key - Replace with your actual access key */}
              <input
                type="hidden"
                name="access_key"
                value="34b6f320-9782-4074-8625-1137553c5c9a"
              />

              {/* Optional: Redirect URL after successful submission */}
              <input
                type="hidden"
                name="redirect"
                value="https://web3forms.com/success"
              />

              {/* Optional: Subject line for the email */}
              <input
                type="hidden"
                name="subject"
                value="New Contact Form Submission from Stallion Contracting UT"
              />

              {/* Optional: From name */}
              <input
                type="hidden"
                name="from_name"
                value="Stallion Contracting UT Website"
              />
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

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>

              {/* Status Messages */}
              {submitStatus === "success" && (
                <div className="form-message success">
                  <span className="material-icons">check_circle</span>
                  Thank you! Your message has been sent successfully. We'll get
                  back to you soon.
                </div>
              )}

              {submitStatus === "error" && (
                <div className="form-message error">
                  <span className="material-icons">error</span>
                  Sorry, there was an error sending your message. Please try
                  again or contact us directly.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
