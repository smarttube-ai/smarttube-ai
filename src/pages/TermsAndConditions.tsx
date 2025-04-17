import Navbar from '../components/landing/Navbar';
import Footer from '../components/Footer';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-[#020817] text-gray-300 flex flex-col">
      <Navbar />
      
      <div className="container mx-auto py-28 px-4 max-w-4xl flex-grow">
        <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">1. Agreement to Terms</h2>
            <p>
              By accessing or using SmartTube AI, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you disagree with any part of the terms, you may not access the service.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">2. Description of Service</h2>
            <p>
              SmartTube AI provides tools for YouTube video analysis, SEO optimization, content creation, and related services. Our service may include features that analyze YouTube videos, generate content suggestions, and provide insights based on video performance data.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
            <p className="mt-2">
              You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">4. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of SmartTube AI and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of SmartTube AI.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">5. User Content</h2>
            <p>
              Our Service allows you to analyze, process, and in some cases store content related to YouTube videos. You are responsible for ensuring that you have the right to use any content you submit to our Service, and that such content does not violate the rights of any third party or any applicable law.
            </p>
            <p className="mt-2">
              You retain any and all of your rights to any content you submit, post or display on or through the Service and you are responsible for protecting those rights. We take no responsibility and assume no liability for content you or any third party posts on or through our Service.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">6. YouTube Terms of Service</h2>
            <p>
              By using our Service to analyze or interact with YouTube content, you agree to comply with YouTube's Terms of Service. Our Service uses the YouTube API Services, and by using these features, you are also agreeing to be bound by the YouTube Terms of Service: <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://www.youtube.com/t/terms</a>
            </p>
            <p className="mt-2">
              Google's Privacy Policy also applies to your use of the YouTube API Services and can be found at: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://policies.google.com/privacy</a>
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">7. Limitation of Liability</h2>
            <p>
              In no event shall SmartTube AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Your access to or use of or inability to access or use the Service;</li>
              <li>Any conduct or content of any third party on the Service;</li>
              <li>Any content obtained from the Service; and</li>
              <li>Unauthorized access, use or alteration of your transmissions or content.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">8. Disclaimer</h2>
            <p>
              Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">9. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">10. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p className="mt-2">
              By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
            </p>
            <p className="mt-2">
              Last Updated: April 14, 2025
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">11. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> <a href="mailto:hello.smarttubeai@gmail.com">hello.smarttubeai@gmail.com</a><br />
              <strong>Address:</strong> Islamabad, Pakistan.
            </p>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
