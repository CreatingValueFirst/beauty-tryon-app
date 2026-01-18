export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-lg max-w-none space-y-6">
        <p className="text-gray-600">Last updated: January 17, 2026</p>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
          <p>
            BeautyTryOn ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when you use our virtual
            try-on platform and services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">2. Information We Collect</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Information You Provide</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, password, phone number</li>
            <li><strong>Profile Information:</strong> Profile picture, preferences, saved styles</li>
            <li><strong>Business Information:</strong> For salon accounts - business name, address, contact details</li>
            <li><strong>Payment Information:</strong> Billing address, payment method (processed securely by Stripe)</li>
            <li><strong>Communications:</strong> Messages sent through our platform, customer support interactions</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Information Collected Automatically</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Camera Images:</strong> Temporary facial and hand images for AR try-on (not stored permanently)</li>
            <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
            <li><strong>Usage Data:</strong> Pages visited, features used, time spent, clicks</li>
            <li><strong>Location Data:</strong> Approximate location based on IP address (with your consent)</li>
            <li><strong>Cookies:</strong> Session data, preferences, analytics</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Information from Third Parties</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Social Media:</strong> If you connect social accounts, we may receive profile information</li>
            <li><strong>Payment Processors:</strong> Transaction confirmations from Stripe</li>
            <li><strong>Analytics Providers:</strong> Aggregated usage statistics</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">3. How We Use Your Information</h2>
          <p>We use collected information for:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Service Delivery:</strong> Provide AR try-on functionality, process bookings, manage accounts</li>
            <li><strong>Personalization:</strong> Recommend styles, customize experience, save preferences</li>
            <li><strong>Communication:</strong> Send booking confirmations, updates, marketing (with consent)</li>
            <li><strong>Payment Processing:</strong> Handle subscriptions, refunds, invoices</li>
            <li><strong>Analytics:</strong> Understand usage patterns, improve features, track performance</li>
            <li><strong>Security:</strong> Detect fraud, prevent abuse, enforce Terms of Service</li>
            <li><strong>Legal Compliance:</strong> Comply with regulations, respond to legal requests</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">4. Camera and AR Technology</h2>
          <p>
            <strong>Important:</strong> Our AR try-on feature uses your device camera to display virtual hair
            and nail styles in real-time.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Camera access is only activated when you explicitly use the try-on feature</li>
            <li>Images are processed locally on your device in real-time</li>
            <li>We do NOT automatically store or upload your camera images</li>
            <li>You can save try-on results voluntarily to your gallery</li>
            <li>Saved images are encrypted and stored securely</li>
            <li>You can delete your saved images at any time</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">5. Information Sharing and Disclosure</h2>
          <p>We may share your information with:</p>

          <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Service Providers</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Supabase:</strong> Database and authentication</li>
            <li><strong>Stripe:</strong> Payment processing</li>
            <li><strong>Vercel:</strong> Hosting and infrastructure</li>
            <li><strong>PostHog:</strong> Analytics (anonymized data)</li>
            <li><strong>Email Service:</strong> Transactional and marketing emails</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Business Transfers</h3>
          <p>
            If we are involved in a merger, acquisition, or sale of assets, your information may be
            transferred. We will notify you before your information becomes subject to a different privacy policy.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">5.3 Legal Requirements</h3>
          <p>
            We may disclose information if required by law or in response to valid requests by public
            authorities (e.g., court orders, subpoenas).
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">5.4 With Your Consent</h3>
          <p>
            We may share information for any other purpose disclosed to you with your explicit consent.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">6. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Encryption of data in transit (HTTPS/TLS)</li>
            <li>Encryption of sensitive data at rest</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication</li>
            <li>Secure payment processing (PCI-DSS compliant via Stripe)</li>
          </ul>
          <p className="mt-4">
            However, no method of transmission over the Internet is 100% secure. We cannot guarantee
            absolute security of your information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">7. Your Privacy Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Access and Portability</h3>
          <p>
            You can access and download your personal data from your account settings.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Correction</h3>
          <p>
            You can update your account information at any time through account settings.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.3 Deletion</h3>
          <p>
            You can request deletion of your account and associated data. Note: We may retain certain
            information for legal or business purposes.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.4 Opt-Out</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Marketing Emails:</strong> Unsubscribe link in every email</li>
            <li><strong>Cookies:</strong> Browser settings to block cookies</li>
            <li><strong>Analytics:</strong> Contact us to opt-out of analytics tracking</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.5 GDPR Rights (EU Users)</h3>
          <p>
            If you are in the European Union, you have additional rights under GDPR including the right
            to object to processing, restrict processing, and lodge complaints with supervisory authorities.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.6 CCPA Rights (California Users)</h3>
          <p>
            California residents have rights under CCPA including the right to know, delete, and opt-out
            of sale of personal information. We do not sell your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">8. Children's Privacy</h2>
          <p>
            Our Service is not intended for children under 13 years of age. We do not knowingly collect
            personal information from children under 13. If you become aware that a child has provided us
            with personal information, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">9. International Data Transfers</h2>
          <p>
            Your information may be transferred to and maintained on servers located outside your country
            where data protection laws may differ. We ensure appropriate safeguards are in place for such transfers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">10. Data Retention</h2>
          <p>
            We retain your information for as long as necessary to provide services and fulfill the purposes
            outlined in this policy, unless a longer retention period is required by law.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>Account Data:</strong> Until account deletion + 90 days</li>
            <li><strong>Transaction Records:</strong> 7 years (legal requirement)</li>
            <li><strong>Analytics Data:</strong> Aggregated indefinitely, individual data 2 years</li>
            <li><strong>Saved Try-On Images:</strong> Until you delete them</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">11. Third-Party Links</h2>
          <p>
            Our Service may contain links to third-party websites. We are not responsible for the privacy
            practices of these external sites. We encourage you to review their privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">12. Changes to Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes
            by posting the new policy on this page and updating the "Last updated" date.
          </p>
          <p className="mt-4">
            Continued use of the Service after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">13. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or wish to exercise your privacy rights, contact us:
          </p>
          <div className="mt-4">
            <p><strong>Email:</strong> privacy@beautytry-on.app</p>
            <p><strong>Data Protection Officer:</strong> dpo@beautytry-on.app</p>
            <p><strong>Address:</strong> [Your Business Address]</p>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            © 2026 BeautyTryOn by Save My Time. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
