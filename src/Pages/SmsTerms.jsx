import React from "react";
import LegalPage from "../Components/LegalPage/LegalPage";

const SmsTerms = () => {
  return (
    <LegalPage
      eyebrow="SMS Terms"
      title="Text Messaging Terms"
      effectiveDate="April 1, 2026"
      intro="These SMS Terms explain how Stallion Contracting uses text messaging for quote notifications and project communication."
    >
      <div className="legal-section">
        <h2>1. Program Description</h2>
        <p>
          Stallion Contracting may send text messages related to project
          estimates, scheduling, on-site consultations, and active project
          updates.
        </p>
      </div>

      <div className="legal-section">
        <h2>2. Consent To Receive Messages</h2>
        <p>
          By providing your mobile number through our website, quote form, or
          other direct communication, you consent to receive SMS messages from
          Stallion Contracting for quote notifications and project-related
          updates.
        </p>
      </div>

      <div className="legal-section">
        <h2>3. Message Frequency</h2>
        <p>
          Message frequency varies based on your project status, estimate
          activity, and ongoing communication needs.
        </p>
      </div>

      <div className="legal-section">
        <h2>4. Opt-Out And Help</h2>
        <ul className="legal-list">
          <li>
            You can opt out of SMS communications at any time by replying
            "STOP" or "UNSUBSCRIBE."
          </li>
          <li>
            For help, contact us at{" "}
            <a href="mailto:ContractingStallion@gmail.com">
              ContractingStallion@gmail.com
            </a>{" "}
            or call <a href="tel:8018005311">801-800-5311</a>.
          </li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>5. Message And Data Rates</h2>
        <p>
          Message and data rates may apply based on your mobile carrier plan.
          Check with your wireless provider for details.
        </p>
      </div>

      <div className="legal-section">
        <h2>6. Privacy</h2>
        <p>
          Mobile information will not be shared with third parties or
          affiliates for marketing or promotional purposes. Our handling of
          personal information is described in our Privacy Policy.
        </p>
      </div>

      <div className="legal-section">
        <h2>7. Delivery And Carrier Responsibility</h2>
        <p>
          Message delivery depends on your wireless carrier and mobile network.
          Carriers are not liable for delayed or undelivered messages.
        </p>
      </div>
    </LegalPage>
  );
};

export default SmsTerms;
