import { Leaf, Target, Shield, Zap } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight">About AgroAI</h1>
        <p className="text-gray-500 mt-4 text-lg">Revolutionizing Agriculture with Deep Learning</p>
      </header>

      <div className="space-y-12">
        {/* Mission Section */}
        <section className="glass p-10 rounded-3xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Target size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Our Mission</h2>
          </div>
          <p className="text-gray-600 leading-relaxed text-lg">
            AgroAI was developed to bridge the gap between advanced satellite technology and practical farming. 
            Our goal is to provide accurate crop type classification using multi-temporal satellite data 
            and high-resolution imagery, enabling better resource management, yield prediction, and 
            sustainable agricultural practices.
          </p>
        </section>

        {/* Technology Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-3xl shadow-md border border-gray-100">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 w-fit mb-4">
              <Zap size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">LSTM Neural Networks</h3>
            <p className="text-gray-600">
              Our Long Short-Term Memory (LSTM) models analyze 6-month NDVI time-series data to recognize 
              the unique growth patterns of different crops over time.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl shadow-md border border-gray-100">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 w-fit mb-4">
              <Leaf size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">CNN Architecture</h3>
            <p className="text-gray-600">
              Convolutional Neural Networks (CNN) process spatial satellite images to identify 
              textural and spectral features unique to specific crop fields.
            </p>
          </div>
        </div>

        {/* Security Section */}
        <section className="glass p-10 rounded-3xl shadow-lg border border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Shield size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Secure & Reliable</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            All data is processed securely with JWT-based authentication and stored in a robust 
            local database. Our models are trained on curated satellite datasets to ensure 
            maximum accuracy and reliability for real-world agricultural scenarios.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
