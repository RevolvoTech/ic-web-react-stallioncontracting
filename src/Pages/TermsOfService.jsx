import React from "react";
import LegalPage from "../Components/LegalPage/LegalPage";

const TermsOfService = () => {
  return (
    <LegalPage
      eyebrow="Terms Of Service"
      title="Website And Service Terms"
      effectiveDate="April 1, 2026"
      intro="These terms govern use of the Stallion Contracting website, quote requests, and project-related communications. Project-specific terms in a signed Service Agreement control if they conflict with this page."
    >
      <div className="legal-section">
        <h2>1. Scope Of These Terms</h2>
        <p>
          By using this website, requesting an estimate, or communicating with
          Stallion Contracting about a project, you agree to these Terms of
          Service. These terms apply to website visitors and prospective or
          current customers in the Wasatch Valley.
        </p>
      </div>

      <div className="legal-section">
        <h2>2. Estimates And Project Proposals</h2>
        <p>
          Website content and quote responses are provided for general
          informational purposes. Estimates may change after site inspection,
          measurements, material selections, permitting requirements, or hidden
          conditions are identified. No project work is scheduled until scope,
          pricing, and timing are confirmed.
        </p>
      </div>

      <div className="legal-section">
        <h2>3. Scheduling And Access</h2>
        <p>
          Proposed timelines may change due to weather, material availability,
          permitting, safety concerns, or unforeseen site conditions. Customers
          are responsible for providing accurate service-address details, safe
          property access, and any required approvals needed for project work.
        </p>
      </div>

      <div className="legal-section">
        <h2>4. Payments And Service Agreements</h2>
        <p>
          Project pricing, deposits, payment schedules, change orders, and
          final-payment terms are governed by your signed Service Agreement,
          estimate approval, or invoice. If there is a difference between this
          page and a signed project document, the signed project document
          controls.
        </p>
      </div>

      <div className="legal-section">
        <h2>5. Communications</h2>
        <p>
          When you provide contact information, you authorize Stallion
          Contracting to contact you about estimates, scheduling, and project
          updates by phone, email, and text message. SMS messaging is also
          governed by our SMS Terms. You may opt out of text communications at
          any time by replying "STOP" or "UNSUBSCRIBE."
        </p>
      </div>

      <div className="legal-section">
        <h2>6. Third Parties, Materials, And Warranties</h2>
        <p>
          We may coordinate with trusted subcontractors or material vendors
          where necessary to complete your project. Manufacturer warranties,
          product availability, and third-party timelines remain subject to
          those third parties' terms and supply conditions.
        </p>
      </div>

      <div className="legal-section">
        <h2>7. Website Use</h2>
        <p>
          You agree not to misuse this website, attempt unauthorized access to
          connected systems, or reproduce website content for commercial use
          without written permission. All website content remains the property
          of Stallion Contracting or its licensors.
        </p>
      </div>

      <div className="legal-section">
        <h2>8. Disclaimer And Limitation</h2>
        <p>
          This website is provided on an "as is" basis for general information
          about our services. To the fullest extent permitted by law, Stallion
          Contracting disclaims liability for indirect or incidental damages
          arising from website use, delays outside reasonable control, or
          reliance on general site content instead of signed project documents.
        </p>
      </div>

      <div className="legal-section">
        <h2>9. Contact Information</h2>
        <p>
          Questions about these terms can be sent to{" "}
          <a href="mailto:ContractingStallion@gmail.com">
            ContractingStallion@gmail.com
          </a>
          .
        </p>
        <div className="legal-note">
          For official project scope, pricing, or warranty details, rely on the
          signed Service Agreement for your specific job.
        </div>
      </div>
    </LegalPage>
  );
};

export default TermsOfService;
