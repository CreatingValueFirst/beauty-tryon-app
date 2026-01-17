export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
      <div className="prose prose-lg max-w-none space-y-6">
        <p className="text-gray-600">Last updated: January 17, 2026</p>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Overview</h2>
          <p>
            At BeautyTryOn, we strive to provide excellent service. This Refund Policy outlines our refund
            and cancellation procedures for both store subscriptions and booking services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">2. Store Subscription Refunds</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Free Trial Period</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>All new store accounts receive a 14-day free trial</li>
            <li>You can cancel anytime during the trial at no charge</li>
            <li>If you cancel before the trial ends, you will not be charged</li>
            <li>No refund is necessary as no payment was collected</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Monthly Subscriptions</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Monthly subscriptions are billed on the same day each month</li>
            <li><strong>Within 7 Days:</strong> Full refund if you cancel within 7 days of your billing date</li>
            <li><strong>After 7 Days:</strong> No refund, but your subscription will not renew next month</li>
            <li>Service access continues until the end of your paid period</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Annual Subscriptions</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Annual subscriptions are billed once per year at a discounted rate</li>
            <li><strong>Within 30 Days:</strong> Full refund if you cancel within 30 days of purchase</li>
            <li><strong>After 30 Days:</strong> Pro-rated refund for unused months (minus 10% processing fee)</li>
            <li>Example: If you cancel after 3 months of a 12-month plan, you'll receive a refund for 9 months minus processing fee</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.4 Upgrades and Downgrades</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Upgrades:</strong> Charged immediately, pro-rated credit for remaining time on old plan</li>
            <li><strong>Downgrades:</strong> Take effect at the end of current billing period, no immediate refund</li>
            <li>You keep access to premium features until downgrade takes effect</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.5 Non-Refundable Items</h3>
          <p>The following are non-refundable:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Setup fees or onboarding charges (if applicable)</li>
            <li>Custom development or integration work</li>
            <li>Third-party services purchased through our platform</li>
            <li>Promotional or discounted subscriptions (unless stated otherwise)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">3. Booking Cancellations and Refunds</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Customer Cancellations</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>More than 48 Hours Before:</strong> Full refund</li>
            <li><strong>24-48 Hours Before:</strong> 50% refund or credit for future booking</li>
            <li><strong>Less than 24 Hours:</strong> No refund (salon cancellation fee applies)</li>
            <li><strong>No-Show:</strong> No refund, full charge applies</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Salon Cancellations</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>If a salon cancels your appointment, you receive a full refund</li>
            <li>You may also receive a courtesy credit for the inconvenience</li>
            <li>Repeated salon cancellations may affect their platform standing</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Emergency Situations</h3>
          <p>
            In cases of documented emergencies (medical, natural disasters, etc.), we may issue full refunds
            at our discretion. Contact customer support with documentation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">4. How to Request a Refund</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Subscription Refunds</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Log into your store dashboard</li>
            <li>Go to Settings → Billing</li>
            <li>Click "Cancel Subscription" or "Request Refund"</li>
            <li>Select your reason for cancellation</li>
            <li>Submit the request</li>
          </ol>
          <p className="mt-4">
            Alternatively, email support@beautytry-on.app with your account details and refund request.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Booking Refunds</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Log into your account</li>
            <li>Go to My Bookings</li>
            <li>Find the booking to cancel</li>
            <li>Click "Cancel Booking"</li>
            <li>Confirm cancellation</li>
          </ol>
          <p className="mt-4">
            Refund eligibility will be calculated automatically based on the time remaining before your appointment.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">5. Refund Processing</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Processing Time</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Refund requests are processed within 2-3 business days</li>
            <li>Approved refunds are issued to your original payment method</li>
            <li>Bank processing may take an additional 5-10 business days</li>
            <li>You'll receive an email confirmation once the refund is processed</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Refund Methods</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Credit/Debit Cards:</strong> Refunded to original card</li>
            <li><strong>PayPal:</strong> Refunded to PayPal account</li>
            <li><strong>Bank Transfer:</strong> Refunded to bank account on file</li>
            <li><strong>Account Credit:</strong> Optional for future purchases (faster processing)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">5.3 Partial Refunds</h3>
          <p>
            Partial refunds may be issued in cases of:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Partial use of annual subscriptions</li>
            <li>Service issues affecting only part of your subscription period</li>
            <li>Downgrade credits</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">6. Disputes and Chargebacks</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Before Filing a Chargeback</h3>
          <p>
            We encourage you to contact us before filing a chargeback with your bank:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Most issues can be resolved quickly through our support team</li>
            <li>Chargebacks may result in account suspension</li>
            <li>Chargeback fees may be passed to you if the chargeback is found invalid</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Dispute Resolution</h3>
          <p>
            If you're unsatisfied with a refund decision:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Request escalation to our customer support manager</li>
            <li>Provide detailed explanation and any supporting documentation</li>
            <li>We'll review your case within 5 business days</li>
            <li>Final decisions will be communicated via email</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">7. Special Circumstances</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Account Termination by Us</h3>
          <p>
            If we terminate your account for violations of our Terms of Service:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>No refund will be issued for the current billing period</li>
            <li>You may be banned from creating new accounts</li>
            <li>Any unpaid amounts become immediately due</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Service Outages</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Minor outages (less than 4 hours): No refund</li>
            <li>Major outages (4-24 hours): Pro-rated credit for downtime</li>
            <li>Extended outages (more than 24 hours): Pro-rated refund option</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.3 Feature Changes</h3>
          <p>
            If we significantly reduce features in your plan:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You'll receive 30 days' notice before changes take effect</li>
            <li>You may cancel and receive a pro-rated refund</li>
            <li>Or downgrade to a lower-cost plan with refund of difference</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">8. Exceptions and Goodwill</h2>
          <p>
            While we strive to be fair, we reserve the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Grant exceptions to this policy in cases of genuine hardship</li>
            <li>Offer partial refunds or credits as gestures of goodwill</li>
            <li>Provide compensation for service issues not covered by this policy</li>
          </ul>
          <p className="mt-4">
            Such exceptions are made at our sole discretion and do not set precedent for future requests.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">9. Changes to Refund Policy</h2>
          <p>
            We may update this Refund Policy from time to time. Changes will not affect refunds already
            in progress. The updated policy applies to purchases made after the effective date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">10. Contact Information</h2>
          <p>
            For refund requests or questions about this policy:
          </p>
          <div className="mt-4">
            <p><strong>Email:</strong> support@beautytry-on.app</p>
            <p><strong>Billing Support:</strong> billing@beautytry-on.app</p>
            <p><strong>Phone:</strong> +1 (800) 123-4567 (Mon-Fri, 9am-5pm EST)</p>
            <p><strong>Live Chat:</strong> Available in your account dashboard</p>
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
