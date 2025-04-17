import Navbar from '../components/landing/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#020817] text-gray-300 flex flex-col">
      <Navbar />
      
      <div className="container mx-auto py-28 px-4 max-w-4xl flex-grow">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">1. Introduction</h2>
            <p>
              Welcome to SmartTube AI. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service. 
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">2. Collection of Your Information</h2>
            <p>
              We may collect information about you in a variety of ways. The information we may collect via the Application includes:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. This may include email address, name, and other similar information.
              </li>
              <li>
                <strong>YouTube Data:</strong> When you use our YouTube analysis tools, we process information from YouTube videos that you choose to analyze. This includes video metadata, statistics, and content.
              </li>
              <li>
                <strong>Usage Data:</strong> We may also collect information that your browser sends whenever you visit our Service or when you access the Service by or through a mobile device.
              </li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">3. Use of Your Information</h2>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Create and manage your account.</li>
              <li>Deliver targeted advertising, newsletters, and other information regarding promotions to you.</li>
              <li>Email you regarding your account or order.</li>
              <li>Enable user-to-user communications.</li>
              <li>Generate a personal profile about you to make future visits to the Application more personalized.</li>
              <li>Increase the efficiency and operation of the Application.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
              <li>Notify you of updates to the Application.</li>
              <li>Perform other business activities as needed.</li>
              <li>Request feedback and contact you about your use of the Application.</li>
              <li>Resolve disputes and troubleshoot problems.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">4. Disclosure of Your Information</h2>
            <p>
              We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
              </li>
              <li>
                <strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
              </li>
              <li>
                <strong>Marketing Communications:</strong> With your consent, or with an opportunity for you to withdraw consent, we may share your information with third parties for marketing purposes.
              </li>
              <li>
                <strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
              </li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">5. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">6. Policy for Children</h2>
            <p>
              We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">7. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> <a href="mailto:hello.smarttubeai@gmail.com">hello.smarttubeai@gmail.com</a><br />
              <strong>Address:</strong> Islamabad, Pakistan.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">8. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
            </p>
            <p className="mt-2">
              Last Updated: April 14, 2025
            </p>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
