import React from "react";
import LegalPage from "../Components/LegalPage/LegalPage";

const PrivacyPolicy = () => {
  return (
    <LegalPage
      eyebrow="Privacy Policy"
      title="Your Information, Handled With Care"
      effectiveDate="April 1, 2026"
      intro="This policy explains how Stallion Contracting collects, uses, and protects information shared through our website, quote requests, and project communications."
    >
      <div className="legal-section">
        <h2>1. Introduction</h2>
        <p>
          Stallion Contracting ("we," "us," or "our") is committed to
          protecting your privacy. This Privacy Policy outlines how we collect,
          use, and safeguard your personal information when you visit our
          website, request a project estimate, or engage our services in the
          Wasatch Valley.
        </p>
      </div>

      <div className="legal-section">
        <h2>2. Information We Collect</h2>
        <ul className="legal-list">
          <li>
            Personal Information: When you submit a Get Your Quote form or
            contact us, we collect your name, phone number, email address, and
            service address.
          </li>
          <li>
            Usage Data: We automatically collect non-identifiable information,
            such as IP addresses and browser types, to optimize website
            performance.
          </li>
          <li>
            Cookies And Remarketing: We use cookies and tracking technologies,
            including Google and Meta pixels. These tools help us analyze site
            traffic and serve relevant advertisements to you on third-party
            platforms based on your past visits to our site.
          </li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>3. How We Use Your Information</h2>
        <ul className="legal-list">
          <li>
            To provide accurate project estimates and schedule on-site
            consultations.
          </li>
          <li>
            To communicate updates regarding your roofing, concrete, or
            basement projects.
          </li>
          <li>To improve our marketing effectiveness and service offerings.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>4. Mobile Communications And SMS Privacy</h2>
        <p>
          By providing your mobile phone number, you explicitly consent to
          receive communications from Stallion Contracting, including text
          messages (SMS), for project updates and quote notifications.
        </p>
        <ul className="legal-list">
          <li>
            No Sharing: Mobile information will not be shared with third
            parties or affiliates for marketing or promotional purposes.
          </li>
          <li>
            Opt-Out: You may opt out of text communications at any time by
            replying "STOP" or "UNSUBSCRIBE." Message and data rates may apply.
          </li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>5. Third-Party Sharing</h2>
        <p>
          We do not sell, rent, or trade your personal information. We share
          your information only with trusted subcontractors or material vendors
          when strictly necessary to fulfill your specific project requirements,
          such as coordinating a shingle delivery or concrete pour.
        </p>
      </div>

      <div className="legal-section">
        <h2>6. Data Security</h2>
        <p>
          We implement industry-standard technical and administrative
          safeguards to protect your data. This includes secure lead management
          through our CRM to prevent unauthorized access or disclosure.
        </p>
      </div>

      <div className="legal-section">
        <h2>7. Your Rights And Contact Information</h2>
        <p>
          You have the right to access, update, or request the deletion of your
          data. For privacy-related inquiries, contact Stallion Contracting at{" "}
          <a href="mailto:ContractingStallion@gmail.com">
            ContractingStallion@gmail.com
          </a>
          .
        </p>
        <div className="legal-note">
          Note: For official project documentation, please refer to your signed
          Service Agreement.
        </div>
      </div>

      <div className="legal-section">
        <h2>8. Consent</h2>
        <p>
          By using our website or submitting your information, you consent to
          the terms of this Privacy Policy.
        </p>
      </div>
    </LegalPage>
  );
};

export default PrivacyPolicy;
