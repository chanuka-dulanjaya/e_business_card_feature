import { CreditCard, Users, Building2, QrCode, Share2, Shield, ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: 'login' | 'register') => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const features = [
    {
      icon: CreditCard,
      title: 'Digital Business Cards',
      description: 'Create professional digital business cards that can be shared instantly with anyone.'
    },
    {
      icon: QrCode,
      title: 'QR Code Sharing',
      description: 'Generate QR codes for your business cards. Just scan and connect.'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Manage your team members and their business cards from one dashboard.'
    },
    {
      icon: Building2,
      title: 'Organization Support',
      description: 'Perfect for organizations with multiple teams and departments.'
    },
    {
      icon: Share2,
      title: 'Easy Sharing',
      description: 'Share your contact details via link, QR code, or social media.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security.'
    }
  ];

  const plans = [
    {
      name: 'Individual',
      description: 'Perfect for freelancers and professionals',
      features: ['1 Digital Business Card', 'QR Code Generation', 'Basic Analytics', 'Public Profile Link'],
      highlighted: false
    },
    {
      name: 'Team',
      description: 'Great for small teams and startups',
      features: ['Unlimited Team Members', 'Team Business Cards', 'Team Management', 'Member Analytics'],
      highlighted: true
    },
    {
      name: 'Organization',
      description: 'For enterprises and large organizations',
      features: ['Multiple Teams', 'Organization Dashboard', 'Advanced Analytics', 'Priority Support'],
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-slate-900 p-2 rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">E-Business Card</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              Your Digital Business Card,{' '}
              <span className="text-blue-400">Reimagined</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Create stunning digital business cards, share them instantly with a QR code,
              and manage your professional network like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('register')}
                className="px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
              >
                Create Your Card Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Sign In to Your Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything You Need for Professional Networking
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform provides all the tools you need to create, share, and manage
              your digital business cards effectively.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="bg-slate-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Choose Your Account Type
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Whether you're an individual professional, a team, or an organization,
              we have the right plan for you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-slate-900 text-white ring-4 ring-slate-900 ring-offset-4'
                    : 'bg-white border-2 border-slate-200'
                }`}
              >
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <p className={`mb-6 ${plan.highlighted ? 'text-slate-300' : 'text-slate-600'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2">
                      <svg
                        className={`w-5 h-5 ${plan.highlighted ? 'text-green-400' : 'text-green-600'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={plan.highlighted ? 'text-slate-200' : 'text-slate-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onNavigate('register')}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-white text-slate-900 hover:bg-slate-100'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Go Digital?
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have already made the switch to digital business cards.
          </p>
          <button
            onClick={() => onNavigate('register')}
            className="px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
          >
            Create Your Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-slate-900 p-1.5 rounded">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900">E-Business Card</span>
            </div>
            <p className="text-slate-600 text-sm">
              &copy; {new Date().getFullYear()} E-Business Card. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
