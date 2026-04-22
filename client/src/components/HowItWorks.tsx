import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiUserPlus, FiCompass, FiBookOpen, FiAward } from 'react-icons/fi';

const HowItWorks: React.FC = () => {
  const { scrollYProgress } = useScroll();

  const steps = [
    {
      icon: <FiUserPlus className="w-8 h-8" />,
      title: "Create Your Account",
      description: "Sign up in seconds and start your learning journey with personalized recommendations.",
      color: "from-blue-500 to-cyan-500",

    },
    {
      icon: <FiCompass className="w-8 h-8" />,
      title: "Choose Your Path",
      description: "Explore skill domains and select the areas that align with your goals and interests.",
      color: "from-purple-500 to-pink-500",

    },
    {
      icon: <FiBookOpen className="w-8 h-8" />,
      title: "Learn & Practice",
      description: "Engage with interactive lessons, real-world projects, and hands-on exercises.",
      color: "from-green-500 to-emerald-500",

    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: "Earn & Showcase",
      description: "Build a portfolio of achievements and showcase your skills to the world.",
      color: "from-orange-500 to-red-500",

    }
  ];

  return (
    <section className="relative py-32 bg-slate-900/40 backdrop-blur-sm overflow-hidden">


      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl font-bold font-display mb-6 text-white">
            How It Works
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Your journey to mastering new skills in four simple steps
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
                ease: "easeOut"
              }}
              whileHover={{ y: -15, scale: 1.02 }}
            >
              {/* Card */}
              <div className="relative bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 shadow-2xl h-full transition-all duration-500 group-hover:border-secondary-green/50 group-hover:shadow-secondary-green/20 overflow-hidden">



                {/* Content */}
                <div className="relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-secondary-green rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300 z-20">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <motion.div
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-300 z-10`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-white">
                      {step.icon}
                    </div>
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold font-display mb-4 text-white group-hover:text-secondary-green transition-colors duration-300">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                    {step.description}
                  </p>
                </div>


              </div>

              {/* Connection Line (for desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-secondary-green to-transparent" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.button
            className="btn-primary text-lg px-8 py-4"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Your Journey
          </motion.button>
        </motion.div>
      </div>


    </section>
  );
};

export default HowItWorks; 