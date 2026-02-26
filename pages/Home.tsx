
import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Layout, Users, FileText, TrendingUp, Shield, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-brand-100">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-brand-500/20">
                <Zap className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">FlowSpace</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-500 hover:text-brand-600 font-medium transition-colors">Features</a>
              <a href="#solutions" className="text-slate-500 hover:text-brand-600 font-medium transition-colors">Solutions</a>
              <a href="#pricing" className="text-slate-500 hover:text-brand-600 font-medium transition-colors">Pricing</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="hidden md:inline-flex text-slate-600 hover:text-brand-600 font-bold px-4 py-2 transition-colors"
              >
                Log In
              </Link>
              <Link 
                to="/register" 
                className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-brand-200 hover:shadow-brand-300 transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-brand-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-50 text-brand-700 font-bold text-sm mb-8 border border-brand-100">
              <span className="flex h-2 w-2 rounded-full bg-brand-600 mr-2"></span>
              New: AI-Powered CRM Pipeline
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
              One Platform to <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Run Your Entire Business</span>
            </h1>
            <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              FlowSpace combines Project Management, CRM, Invoicing, and Team Collaboration into one intuitive suite. Stop switching apps and start growing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/register" 
                className="w-full sm:w-auto px-8 py-4 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-200 hover:shadow-2xl hover:shadow-brand-300 flex items-center justify-center"
              >
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5"/>
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center">
                <Layout className="mr-2 w-5 h-5"/> View Demo
              </button>
            </div>
            <p className="mt-6 text-sm text-slate-400">No credit card required · 14-day free trial · Cancel anytime</p>
          </div>

          {/* Hero Image Mockup */}
          <div className="mt-20 relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="bg-slate-900 rounded-2xl shadow-2xl p-2 md:p-3 border border-slate-800 ring-1 ring-slate-900/10">
               <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700/50 aspect-[16/10] relative group">
                  {/* Abstract UI Representation */}
                  <div className="absolute inset-0 bg-slate-900 flex">
                     {/* Sidebar */}
                     <div className="w-64 border-r border-slate-800 p-6 hidden md:block bg-slate-900">
                        <div className="flex items-center mb-8 gap-3">
                           <div className="h-8 w-8 bg-brand-600 rounded-lg"></div>
                           <div className="h-4 w-24 bg-slate-700 rounded"></div>
                        </div>
                        <div className="space-y-4">
                           {[1,2,3,4,5,6].map(i => <div key={i} className="h-4 w-full bg-slate-800 rounded-lg"></div>)}
                        </div>
                     </div>
                     {/* Main Content */}
                     <div className="flex-1 p-8 bg-slate-800/50">
                        <div className="flex justify-between mb-8">
                           <div className="space-y-2">
                             <div className="h-8 w-48 bg-slate-700 rounded-lg"></div>
                             <div className="h-4 w-32 bg-slate-700/50 rounded"></div>
                           </div>
                           <div className="h-10 w-32 bg-brand-600 rounded-lg"></div>
                        </div>
                        <div className="grid grid-cols-4 gap-6 mb-8">
                           <div className="h-32 bg-slate-800 rounded-xl border border-slate-700 p-4">
                             <div className="h-8 w-8 bg-slate-700 rounded-lg mb-4"></div>
                             <div className="h-4 w-12 bg-slate-700/50 rounded mb-2"></div>
                             <div className="h-6 w-24 bg-slate-700 rounded"></div>
                           </div>
                           <div className="h-32 bg-slate-800 rounded-xl border border-slate-700 p-4">
                             <div className="h-8 w-8 bg-slate-700 rounded-lg mb-4"></div>
                             <div className="h-4 w-12 bg-slate-700/50 rounded mb-2"></div>
                             <div className="h-6 w-24 bg-slate-700 rounded"></div>
                           </div>
                           <div className="h-32 bg-slate-800 rounded-xl border border-slate-700 p-4">
                             <div className="h-8 w-8 bg-slate-700 rounded-lg mb-4"></div>
                             <div className="h-4 w-12 bg-slate-700/50 rounded mb-2"></div>
                             <div className="h-6 w-24 bg-slate-700 rounded"></div>
                           </div>
                           <div className="h-32 bg-slate-800 rounded-xl border border-slate-700 p-4">
                             <div className="h-8 w-8 bg-slate-700 rounded-lg mb-4"></div>
                             <div className="h-4 w-12 bg-slate-700/50 rounded mb-2"></div>
                             <div className="h-6 w-24 bg-slate-700 rounded"></div>
                           </div>
                        </div>
                        <div className="h-64 bg-slate-800 rounded-xl border border-slate-700 p-6 flex items-end gap-4">
                           <div className="w-full bg-slate-700/30 h-32 rounded-t"></div>
                           <div className="w-full bg-brand-600/20 h-48 rounded-t"></div>
                           <div className="w-full bg-slate-700/30 h-24 rounded-t"></div>
                           <div className="w-full bg-slate-700/30 h-40 rounded-t"></div>
                           <div className="w-full bg-slate-700/30 h-32 rounded-t"></div>
                        </div>
                     </div>
                  </div>
                  {/* Overlay Content */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm">
                     <Link to="/register" className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:scale-105 transition-transform shadow-2xl">Explore the Dashboard</Link>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need in one place</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">Replace your disconnected tools with a single, powerful operating system for your business.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Layout className="w-6 h-6 text-white"/>}
              color="bg-blue-500"
              title="Project Management"
              desc="Plan projects, track progress with Kanban boards, and manage tasks effortlessly."
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-white"/>}
              color="bg-indigo-500"
              title="CRM & Sales"
              desc="Manage your sales pipeline, track leads, and close deals faster with visual tools."
            />
            <FeatureCard 
              icon={<FileText className="w-6 h-6 text-white"/>}
              color="bg-emerald-500"
              title="Invoicing & Finance"
              desc="Create professional invoices, track expenses, and get paid online instantly."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-6 h-6 text-white"/>}
              color="bg-rose-500"
              title="Financial Reporting"
              desc="Real-time dashboards showing your P&L, cash flow, and business health."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-white"/>}
              color="bg-purple-500"
              title="Web Forms"
              desc="Collect data from clients with custom drag-and-drop forms and surveys."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-white"/>}
              color="bg-slate-800"
              title="Team Collaboration"
              desc="Built-in activity feeds, commenting, and role-based access control."
            />
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
               <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Why choose FlowSpace?</h2>
                  <div className="space-y-6">
                     {[
                        "All-in-one integrated platform",
                        "Simple and intuitive user interface",
                        "Powerful automation features",
                        "Real-time financial insights",
                        "Bank-level security"
                     ].map((item, i) => (
                        <div key={i} className="flex items-center">
                           <CheckCircle2 className="w-6 h-6 text-brand-600 mr-4" />
                           <span className="text-lg text-slate-600">{item}</span>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="relative">
                  <div className="absolute inset-0 bg-brand-100 rounded-3xl transform rotate-3"></div>
                  <div className="relative bg-slate-900 rounded-3xl p-8 shadow-2xl">
                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-white/50 text-sm border-b border-white/10 pb-4">
                           <span>Monthly Revenue</span>
                           <span>+12.5%</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                           <span className="text-4xl font-bold text-white">$124,500</span>
                           <span className="text-brand-400">USD</span>
                        </div>
                        <div className="h-32 flex items-end gap-2 pt-4">
                           {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                              <div key={i} className="flex-1 bg-brand-500/20 rounded-t-lg relative group overflow-hidden">
                                 <div 
                                    className="absolute bottom-0 left-0 right-0 bg-brand-500 transition-all duration-1000" 
                                    style={{height: `${h}%`}}
                                 ></div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-600 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-brand-900/20">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to streamline your business?</h2>
             <p className="text-brand-100 text-xl mb-10 max-w-2xl mx-auto relative z-10">Join thousands of teams who use FlowSpace to manage their projects and finances.</p>
             <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
               <Link to="/register" className="px-8 py-4 bg-white text-brand-600 rounded-xl font-bold text-lg hover:bg-brand-50 transition-colors">Get Started for Free</Link>
             </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center mr-2">
                  <Zap className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-slate-900">FlowSpace</span>
              </div>
              <p className="text-slate-500 text-sm">The all-in-one workspace for modern businesses.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-brand-600">Features</a></li>
                <li><a href="#" className="hover:text-brand-600">Pricing</a></li>
                <li><a href="#" className="hover:text-brand-600">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-brand-600">About Us</a></li>
                <li><a href="#" className="hover:text-brand-600">Careers</a></li>
                <li><a href="#" className="hover:text-brand-600">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-brand-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-brand-600">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-center text-sm text-slate-400">
            &copy; 2023 FlowSpace Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{icon: React.ReactNode, color: string, title: string, desc: string}> = ({ icon, color, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

export default Home;
