import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import "./Contact.scss";

const Contact = () => {
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    if (submitStatus === "success") {
      const timer = setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

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
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <div className="section-label">Contact Us</div>
          <h1>Get in Touch</h1>
          <p>
            We're here to answer your questions and help you with your contracting
            needs.
          </p>

          <div className="form">
            <div className="left">
              <h3>Contact Us</h3>
              <p>
                Let us know how we can help. Fill out the form and we'll get back
                to you as soon as possible.
              </p>
            </div>

            <div className="right">
              <form onSubmit={handleSubmit} className="contact-form">
                <input
                  type="hidden"
                  name="access_key"
                  value="34b6f320-9782-4074-8625-1137553c5c9a"
                />

                <input
                  type="hidden"
                  name="redirect"
                  value="https://web3forms.com/success"
                />

                <input
                  type="hidden"
                  name="subject"
                  value="New Contact Form Submission from Stallion Contracting"
                />

                <input
                  type="hidden"
                  name="from_name"
                  value="Stallion Contracting Website"
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
                    country={"us"}
                    enableSearch
                    value={phone}
                    onChange={setPhone}
                    inputProps={{
                      id: "phone",
                      name: "phone",
                      required: true,
                      placeholder: "",
                    }}
                  />
                </div>

                <input type="hidden" name="phone" value={phone} />

                <div className="form-group">
                  <label htmlFor="message">Message (optional)</label>
                  <textarea id="message" name="message" rows="5" />
                </div>

                <p className="form-disclaimer">
                  By submitting this form and providing your mobile number, you
                  agree to receive project updates and quote notifications from
                  Stallion Contracting. Reply "STOP" or "UNSUBSCRIBE" to opt
                  out. Message and data rates may apply. View our{" "}
                  <Link to="/privacy-policy">Privacy Policy</Link> and{" "}
                  <Link to="/sms-terms">SMS Terms</Link>.
                </p>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>

                {submitStatus === "success" && (
                  <div className="form-message success">
                    <span className="material-icons">check_circle</span>
                    <div className="message-content">
                      <strong>Message Sent Successfully!</strong>
                      <p>Thank you for contacting Stallion Contracting. We've received your inquiry and will get back to you within 24 hours.</p>
                    </div>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="form-message error">
                    <span className="material-icons">error</span>
                    <div className="message-content">
                      <strong>Oops! Something went wrong.</strong>
                      <p>
                        Please try again or contact us directly at
                        ContractingStallion@gmail.com
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
