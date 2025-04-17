import React, { useState } from 'react';
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('contact');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'normal'
  });

  const [bugForm, setBugForm] = useState({
    name: '',
    email: '',
    title: '',
    description: '',
    steps: '',
    expectedBehavior: '',
    actualBehavior: '',
    browserInfo: ''
  });

  const [featureForm, setFeatureForm] = useState({
    name: '',
    email: '',
    title: '',
    description: '',
    useCase: '',
    impact: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let formData: Record<string, any> = {};
    
    switch (activeTab) {
      case 'contact':
        formData = {
          ...contactForm,
          form_type: 'Contact Support'
        };
        break;
      case 'bug':
        formData = {
          ...bugForm,
          form_type: 'Bug Report'
        };
        break;
      case 'feature':
        formData = {
          ...featureForm,
          form_type: 'Feature Request'
        };
        break;
    }

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: '0396421a-545d-4d63-b44a-af2f6b397f36',
          ...formData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        // Reset form
        switch (activeTab) {
          case 'contact':
            setContactForm({
              name: '',
              email: '',
              subject: '',
              message: '',
              priority: 'normal'
            });
            break;
          case 'bug':
            setBugForm({
              name: '',
              email: '',
              title: '',
              description: '',
              steps: '',
              expectedBehavior: '',
              actualBehavior: '',
              browserInfo: ''
            });
            break;
          case 'feature':
            setFeatureForm({
              name: '',
              email: '',
              title: '',
              description: '',
              useCase: '',
              impact: ''
            });
            break;
        }
        setTimeout(() => setSuccess(false), 5000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      setError('Failed to submit form. Please try again later.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'contact', label: 'Contact Support', icon: MessageSquare },
    { id: 'bug', label: 'Report a Bug', icon: Bug },
    { id: 'feature', label: 'Feature Request', icon: Lightbulb },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-start justify-center py-8">
      <div className="w-full max-w-3xl mx-auto px-6">
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-black'
                    : 'bg-[#1F2937] text-white hover:bg-[#374151]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-4 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <p>Your submission has been received. We'll get back to you soon!</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg">
              <XCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          {/* Contact Support Form */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSubmit} className="border border-[#1F2937] rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2">Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full h-12 bg-[#0A0A0A] rounded-md px-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full h-12 bg-[#0A0A0A] rounded-md px-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                    placeholder="Your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full h-12 bg-[#0A0A0A] rounded-md px-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                  placeholder="Brief description of your inquiry"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Priority</label>
                <select
                  value={contactForm.priority}
                  onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value })}
                  className="w-full h-12 bg-[#0A0A0A] rounded-md px-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full h-32 bg-[#0A0A0A] rounded-md p-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
                  placeholder="Describe your issue or question in detail"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-white text-black rounded-md font-medium flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bug Report Form */}
          {activeTab === 'bug' && (
            <form onSubmit={handleSubmit} className="border border-[#1F2937] rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2">Name</label>
                  <input
                    type="text"
                    value={bugForm.name}
                    onChange={(e) => setBugForm({ ...bugForm, name: e.target.value })}
                    className="w-full h-12 bg-[#0A0A0A] rounded-md px-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={bugForm.email}
                    onChange={(e) => setBugForm({ ...bugForm, email: e.target.value })}
                    className="w-full h-12 bg-[#0A0A0A] rounded-md px-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                    placeholder="Your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Bug Title</label>
                <input
                  type="text"
                  value={bugForm.title}
                  onChange={(e) => setBugForm({ ...bugForm, title: e.target.value })}
                  className="w-full h-12 bg-[#0A0A0A] rounded-md px-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                  placeholder="Brief description of the bug"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Description</label>
                <textarea
                  value={bugForm.description}
                  onChange={(e) => setBugForm({ ...bugForm, description: e.target.value })}
                  className="w-full h-32 bg-[#0A0A0A] rounded-md p-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
                  placeholder="Detailed description of the bug"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Steps to Reproduce</label>
                <textarea
                  value={bugForm.steps}
                  onChange={(e) => setBugForm({ ...bugForm, steps: e.target.value })}
                  className="w-full h-32 bg-[#0A0A0A] rounded-md p-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
                  placeholder="1. First step&#10;2. Second step&#10;3. Third step"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2">Expected Behavior</label>
                  <textarea
                    value={bugForm.expectedBehavior}
                    onChange={(e) => setBugForm({ ...bugForm, expectedBehavior: e.target.value })}
                    className="w-full h-24 bg-[#0A0A0A] rounded-md p-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
                    placeholder="What should happen"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Actual Behavior</label>
                  <textarea
                    value={bugForm.actualBehavior}
                    onChange={(e) => setBugForm({ ...bugForm, actualBehavior: e.target.value })}
                    className="w-full h-24 bg-[#0A0A0A] rounded-md p-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
                    placeholder="What actually happens"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Browser & System Info</label>
                <input
                  type="text"
                  value={bugForm.browserInfo}
                  onChange={(e) => setBugForm({ ...bugForm, browserInfo: e.target.value })}
                  className="w-full h-12 bg-[#0A0A0A] rounded-md px-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                  placeholder="e.g., Chrome 91.0.4472.124 on Windows 10"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-white text-black rounded-md font-medium flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Bug Report
                  </>
                )}
              </button>
            </form>
          )}

          {/* Feature Request Form */}
          {activeTab === 'feature' && (
            <form onSubmit={handleSubmit} className="border border-[#1F2937] rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2">Name</label>
                  <input
                    type="text"
                    value={featureForm.name}
                    onChange={(e) => setFeatureForm({ ...featureForm, name: e.target.value })}
                    className="w-full h-12 bg-[#0A0A0A] rounded-md px-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={featureForm.email}
                    onChange={(e) => setFeatureForm({ ...featureForm, email: e.target.value })}
                    className="w-full h-12 bg-[#0A0A0A] rounded-md px-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                    placeholder="Your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Feature Title</label>
                <input
                  type="text"
                  value={featureForm.title}
                  onChange={(e) => setFeatureForm({ ...featureForm, title: e.target.value })}
                  className="w-full h-12 bg-[#0A0A0A] rounded-md px-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                  placeholder="Brief description of the feature"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Description</label>
                <textarea
                  value={featureForm.description}
                  onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })}
                  className="w-full h-32 bg-[#0A0A0A] rounded-md p-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
                  placeholder="Detailed description of the feature"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Use Case</label>
                <textarea
                  value={featureForm.useCase}
                  onChange={(e) => setFeatureForm({ ...featureForm, useCase: e.target.value })}
                  className="w-full h-32 bg-[#0A0A0A] rounded-md p-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
                  placeholder="Describe how and when this feature would be used"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Expected Impact</label>
                <textarea
                  value={featureForm.impact}
                  onChange={(e) => setFeatureForm({ ...featureForm, impact: e.target.value })}
                  className="w-full h-32 bg-[#0A0A0A] rounded-md p-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
                  placeholder="Describe the potential impact and benefits of this feature"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-white text-black rounded-md font-medium flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feature Request
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}