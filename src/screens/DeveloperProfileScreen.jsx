import React, { useState } from 'react'
import { FiGithub, FiLinkedin, FiTwitter, FiMail, FiArrowRight, FiDownload, FiEye, FiStar, FiExternalLink } from 'react-icons/fi'
import { useStore } from '../store/useStore'

export default function DeveloperProfileScreen() {
  const { setCurrentScreen } = useStore()
  const [expandedProject, setExpandedProject] = useState(null)

  const socialLinks = [
    {
      icon: FiGithub,
      label: 'GitHub',
      url: 'https://github.com/sakachowdhury',
      color: 'hover:text-gray-300',
      desc: 'Follow my open source projects'
    },
    {
      icon: FiLinkedin,
      label: 'LinkedIn',
      url: 'https://linkedin.com/in/sakachowdhury',
      color: 'hover:text-blue-400',
      desc: 'Connect with me professionally'
    },
    {
      icon: FiTwitter,
      label: 'Twitter',
      url: 'https://twitter.com/sakachowdhury',
      color: 'hover:text-blue-300',
      desc: 'Follow for tech updates'
    },
    {
      icon: FiMail,
      label: 'Email',
      url: 'mailto:saka@example.com',
      color: 'hover:text-neon-blue',
      desc: 'Get in touch with me'
    },
  ]

  const projects = [
    {
      name: 'StreamX',
      description: 'Netflix-like movie discovery platform with custom video player',
      tech: ['React', 'Tailwind CSS', 'Zustand', 'Vite'],
      stars: 234,
      views: 1200,
      image: '🎬',
      link: '#'
    },
    {
      name: 'Movie Extractor API',
      description: 'Advanced web scraper for movies with MongoDB integration',
      tech: ['Node.js', 'Express', 'MongoDB', 'Cheerio'],
      stars: 156,
      views: 890,
      image: '🎥',
      link: '#'
    },
    {
      name: 'Chat Application',
      description: 'Real-time messaging platform with WebSocket support',
      tech: ['React', 'Socket.io', 'Node.js', 'PostgreSQL'],
      stars: 198,
      views: 1050,
      image: '💬',
      link: '#'
    },
    {
      name: 'E-commerce Platform',
      description: 'Full-stack online store with payment integration',
      tech: ['MERN', 'Stripe', 'JWT', 'Tailwind'],
      stars: 267,
      views: 1500,
      image: '🛍️',
      link: '#'
    },
  ]

  const skills = [
    { category: 'Frontend', skills: ['React', 'Vue.js', 'Angular', 'Tailwind CSS', 'Vite', 'Webpack'] },
    { category: 'Backend', skills: ['Node.js', 'Express', 'Python', 'Django', 'REST API', 'GraphQL'] },
    { category: 'Database', skills: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase'] },
    { category: 'DevOps', skills: ['Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'AWS', 'Google Cloud'] },
  ]

  return (
    <div className="min-h-screen">
      <button
        onClick={() => setCurrentScreen('home')}
        className="fixed top-24 left-4 z-40 flex items-center gap-2 text-neon-blue hover:gap-4 transition-all"
      >
        ← Back
      </button>

      <div className="max-w-6xl mx-auto p-4 pt-20">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-8 p-6 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full hover-glow transition-all">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-dark-bg">
              <img
                src="https://github.com/salahuddingfx.png"
                alt="Developer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple mb-4 glow-text-blue">
            Saka Chowdhury
          </h1>
          
          <p className="text-2xl text-neon-blue font-bold mb-3">Full Stack Developer & Creative Technologist</p>
          
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Building exceptional digital experiences with cutting-edge web technologies. 
            Passionate about creating beautiful, scalable, and user-centric applications.
          </p>
        </div>

        {/* Social Links Enhanced */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {socialLinks.map((social) => {
            const Icon = social.icon
            return (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-effect p-6 rounded-xl hover-glow transition-all text-center group"
              >
                <Icon className={`text-4xl mb-3 mx-auto ${social.color} transition-all group-hover:scale-125`} />
                <p className="font-bold text-neon-blue mb-1">{social.label}</p>
                <p className="text-xs text-gray-400">{social.desc}</p>
                <FiExternalLink className="inline-block mt-2 text-neon-purple opacity-0 group-hover:opacity-100 transition-all" />
              </a>
            )
          })}
        </div>

        {/* About Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">About Me</h2>
          <div className="glass-effect p-8 rounded-xl border border-neon-blue border-opacity-20">
            <p className="text-gray-300 leading-relaxed mb-4 text-lg">
              I'm a passionate full-stack developer with over 5 years of experience creating stunning web applications. 
              My expertise spans modern frontend frameworks like React, backend technologies with Node.js, 
              and database design with both SQL and NoSQL solutions.
            </p>
            <p className="text-gray-300 leading-relaxed text-lg">
              I specialize in building scalable, performant applications that prioritize user experience. 
              Whether it's crafting beautiful UIs with Tailwind CSS or architecting robust backend systems, 
              I bring creativity and technical excellence to every project.
            </p>
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">Technical Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skills.map((skill) => (
              <div key={skill.category} className="glass-effect p-6 rounded-xl hover-glow transition-all">
                <h3 className="text-neon-purple font-bold mb-4 text-lg">{skill.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skill.skills.map((s) => (
                    <span
                      key={s}
                      className="px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-full text-sm font-semibold hover:scale-110 transition-transform"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Projects */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, idx) => (
              <div
                key={idx}
                className="glass-effect rounded-xl overflow-hidden hover-glow transition-all cursor-pointer group"
                onClick={() => setExpandedProject(expandedProject === idx ? null : idx)}
              >
                <div className="p-6">
                  <div className="text-5xl mb-4">{project.image}</div>
                  <h3 className="text-xl font-bold mb-2 text-neon-blue group-hover:text-neon-purple transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-gray-400 mb-4 text-sm">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((t) => (
                      <span key={t} className="px-2 py-1 bg-dark-card rounded text-xs text-neon-blue">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neon-blue border-opacity-20">
                    <div className="flex gap-4 text-gray-400">
                      <div className="flex items-center gap-1">
                        <FiStar size={16} />
                        <span className="text-sm">{project.stars}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiEye size={16} />
                        <span className="text-sm">{project.views}</span>
                      </div>
                    </div>
                    <a
                      href={project.link}
                      className="text-neon-blue hover:text-neon-purple group-hover:translate-x-2 transition-all"
                    >
                      <FiArrowRight />
                    </a>
                  </div>
                </div>

                {expandedProject === idx && (
                  <div className="bg-dark-card p-4 border-t border-neon-blue border-opacity-20 slide-in">
                    <p className="text-sm text-gray-300 mb-3">
                      A showcase project demonstrating expertise in modern web development with focus on user experience.
                    </p>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-neon-blue hover:text-neon-purple transition-colors"
                    >
                      <FiDownload size={16} />
                      View Project
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { label: 'Projects', value: '50+' },
            { label: 'Experience', value: '5+ yrs' },
            { label: 'Happy Clients', value: '100+' },
            { label: 'Contributions', value: '500+' },
          ].map((stat) => (
            <div key={stat.label} className="glass-effect p-6 rounded-xl text-center hover-glow transition-all">
              <p className="text-3xl font-bold text-neon-blue mb-2">{stat.value}</p>
              <p className="text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="glass-effect p-8 rounded-xl text-center border border-neon-blue border-opacity-20 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-neon-blue">Get In Touch</h2>
          <p className="text-gray-300 mb-6">
            Have a project in mind? Let's collaborate and create something amazing together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:saka@example.com"
              className="inline-block px-8 py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold rounded-lg hover:shadow-glow-intense transition-all"
            >
              Send Me an Email
            </a>
            <button
              onClick={() => setCurrentScreen('extractor')}
              className="inline-block px-8 py-3 bg-gradient-to-r from-neon-purple to-pink-600 text-white font-bold rounded-lg hover:shadow-glow-intense transition-all"
            >
              🎬 Movie Extractor
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
