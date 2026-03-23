const askBtn = document.getElementById("askBtn");
const aiInput = document.getElementById("aiInput");
const aiStatus = document.getElementById("aiStatus");
const chatContainer = document.getElementById("chatContainer");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileNav = document.getElementById("mobileNav");
const themeToggle = document.getElementById("themeToggle");
const typewriter = document.getElementById("typewriter");
const cursor = document.getElementById("cursor");
const cursorTrail = document.getElementById("cursor-trail");
const pageLoader = document.getElementById("pageLoader");
const projectModal = document.getElementById("projectModal");
const copyEmailBtn = document.getElementById("copyEmailBtn");
const focusModeBtn = document.getElementById("focusModeBtn");
const scrollTopBtn = document.getElementById("scrollTopBtn");
const scrollProgressBar = document.getElementById("scrollProgressBar");
const quickQuestionButtons = document.querySelectorAll(".quick-question-btn[data-question]");
const clearChatBtn = document.getElementById("clearChatBtn");
const imageDropZone = document.getElementById("imageDropZone");
const imageUploadInput = document.getElementById("imageUploadInput");
const projectFilters = document.querySelectorAll('.project-filter');
const projectSearch = document.getElementById('projectSearch');
const projectCards = document.querySelectorAll('.project-card');
const repoSort = document.getElementById('repoSort');
const terminalModeBtn = document.getElementById('terminalModeBtn');
const terminalPanel = document.getElementById('terminalPanel');
const closeTerminalBtn = document.getElementById('closeTerminalBtn');
const terminalInput = document.getElementById('terminalInput');
const terminalOutput = document.getElementById('terminalOutput');
const visitorCounter = document.getElementById('visitorCounter');
const easterEgg = document.getElementById('easterEgg');
const journeyFilters = document.querySelectorAll('.journey-filter');
const journeyCards = document.querySelectorAll('.journey-card');
const journeyStatSection = document.getElementById('journeyStats');

// OpenRouter API Configuration
const OPENROUTER_API_KEY = "YOUR_OPENROUTER_API_KEY";
const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

// AI System Message
const aiSystemMessage = {
  role: "system",
  content: "You are Kaveesha's AI assistant. Answer questions about her skills, projects, and experience. Be helpful, concise, and professional."
};

// Chat History
let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');

// Typewriter Configuration
const roles = [
  "Software Engineering Undergraduate",
  "AI Enthusiast",
  "Java & Web Developer"
];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let selectedProjectFilter = 'all';
let repoSortMode = 'updated';
let easterBuffer = '';

// Initialize AOS
AOS.init({
  duration: 800,
  once: true,
  offset: 100
});

// Custom Cursor
document.addEventListener('mousemove', (e) => {
  if (cursor && cursorTrail) {
    cursor.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;

    setTimeout(() => {
      cursorTrail.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
    }, 100);
  }
});

document.querySelectorAll('a, button, input, textarea, select, [role="button"]').forEach((el) => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

function formatMessageTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Typewriter Effect
function typeWriter() {
  const currentRole = roles[roleIndex];
  const speed = isDeleting ? 50 : 100;

  if (!isDeleting && charIndex < currentRole.length) {
    typewriter.textContent = currentRole.substring(0, charIndex + 1);
    charIndex++;
    setTimeout(typeWriter, speed);
  } else if (isDeleting && charIndex > 0) {
    typewriter.textContent = currentRole.substring(0, charIndex - 1);
    charIndex--;
    setTimeout(typeWriter, speed);
  } else if (!isDeleting && charIndex === currentRole.length) {
    setTimeout(() => {
      isDeleting = true;
      typeWriter();
    }, 2000);
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    setTimeout(typeWriter, 500);
  }
}

// AI Chat Functions
async function askAI(question) {
  if (!question.trim()) return;

  const messageTime = formatMessageTime(new Date());

  // Add user message to chat
  addMessageToChat('user', question, { timestamp: messageTime });
  aiInput.value = '';

  // Show typing indicator
  showTypingIndicator();

  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === "YOUR_OPENROUTER_API_KEY") {
    hideTypingIndicator();
    addMessageToChat('assistant', "Please set your OpenRouter API key in the script.js file to use the AI assistant.");
    return;
  }

  try {
    const messages = [aiSystemMessage, ...chatHistory.slice(-10), { role: "user", content: question }];

    const response = await fetch(openRouterUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        max_tokens: 300,
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    const nowStamp = formatMessageTime(new Date());

    // Add AI response to chat with typing effect
    hideTypingIndicator();
    await addMessageToChat('assistant', aiResponse, { typing: true, timestamp: nowStamp });

    // Update chat history
    chatHistory.push({ role: "user", content: question, timestamp: messageTime });
    chatHistory.push({ role: "assistant", content: aiResponse, timestamp: nowStamp });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

  } catch (error) {
    console.error(error);
    hideTypingIndicator();
    addMessageToChat('assistant', `Error: ${error.message}`);
  }
}

async function addMessageToChat(sender, message, options = {}) {
  const { typing = false, timestamp = formatMessageTime(new Date()), isImage = false } = options;
  const messageDiv = document.createElement('div');
  messageDiv.className = `flex gap-3 mb-4 ${sender === 'user' ? 'justify-end' : ''}`;
  const safeMessage = escapeHtml(message);

  if (isImage) {
    messageDiv.innerHTML = `
      <div class="glass-card p-2 max-w-xs ml-auto">
        <img src="${message}" alt="Uploaded preview" class="rounded-lg max-h-40 w-full object-cover" loading="lazy" />
        <span class="chat-time">${timestamp}</span>
      </div>
      <div class="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
        <i data-feather="image" class="w-4 h-4 text-white"></i>
      </div>
    `;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    feather.replace();
    return;
  }

  if (sender === 'assistant') {
    messageDiv.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
        <i data-feather="bot" class="w-4 h-4 text-white"></i>
      </div>
      <div class="glass-card p-3 max-w-xs">
        <p class="text-sm text-gray-300" data-ai-text>${typing ? '' : safeMessage}</p>
        <span class="chat-time">${timestamp}</span>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="glass-card p-3 max-w-xs ml-auto">
        <p class="text-sm text-white">${safeMessage}</p>
        <span class="chat-time">${timestamp}</span>
      </div>
      <div class="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
        <i data-feather="user" class="w-4 h-4 text-white"></i>
      </div>
    `;
  }

  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  feather.replace();

  if (typing && sender === 'assistant') {
    const aiTextElement = messageDiv.querySelector('[data-ai-text]');
    if (aiTextElement) {
      for (let i = 0; i < safeMessage.length; i++) {
        aiTextElement.innerHTML += safeMessage[i];
        await new Promise((resolve) => setTimeout(resolve, 12));
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }
}

function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typingIndicator';
  typingDiv.className = 'flex gap-3 mb-4';
  typingDiv.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
      <i data-feather="bot" class="w-4 h-4 text-white"></i>
    </div>
    <div class="glass-card p-3">
      <div class="typing-spinner"></div>
    </div>
  `;
  chatContainer.appendChild(typingDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  feather.replace();
}

function hideTypingIndicator() {
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// GitHub API Integration
async function fetchGitHubRepos() {
  try {
    const response = await fetch('https://api.github.com/users/kav488/repos?per_page=12');
    const reposRaw = await response.json();

    const repos = Array.isArray(reposRaw) ? reposRaw.slice() : [];
    repos.sort((a, b) => {
      if (repoSortMode === 'stars') {
        return b.stargazers_count - a.stargazers_count;
      }
      return new Date(b.updated_at) - new Date(a.updated_at);
    });

    const githubRepos = document.getElementById('githubRepos');
    githubRepos.innerHTML = '';

    repos.slice(0, 6).forEach(repo => {
      const repoCard = document.createElement('div');
      repoCard.className = 'glass-card p-6 hover:transform hover:scale-105 transition-all duration-300';
      repoCard.innerHTML = `
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-bold text-white truncate">${repo.name}</h3>
          <div class="flex items-center gap-3 text-sm text-gray-400">
            <span class="inline-flex items-center gap-1"><i data-feather="star" class="w-4 h-4"></i>${repo.stargazers_count}</span>
            <span class="inline-flex items-center gap-1"><i data-feather="git-branch" class="w-4 h-4"></i>${repo.forks_count}</span>
          </div>
        </div>
        <p class="text-gray-300 text-sm mb-4 line-clamp-2">${repo.description || 'No description available'}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span class="text-xs text-gray-400">${repo.language || 'N/A'}</span>
          </div>
          <a href="${repo.html_url}" target="_blank" class="text-pink-400 hover:text-pink-300 transition-colors">
            <i data-feather="external-link" class="w-4 h-4"></i>
          </a>
        </div>
      `;
      githubRepos.appendChild(repoCard);
    });

    feather.replace();
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    document.getElementById('githubRepos').innerHTML = '<p class="text-gray-400 text-center">Unable to load repositories</p>';
  }
}

// Project Modal Functions
function openProjectModal(projectType) {
  const modal = document.getElementById('projectModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');

  const projectMap = {
    'ai-chatbot': {
      title: 'AI Chatbot Project',
      overview: 'An interactive conversational assistant powered by OpenRouter API, featuring advanced AI capabilities and seamless user interaction.',
      technologies: ['JavaScript (ES6+)', 'OpenRouter API', 'HTML5 & CSS3', 'RESTful API Integration'],
      features: ['Text & Image Input Support', 'Typing Animation Responses', 'Conversation History', 'Customizable AI Models'],
      liveDemo: '#',
      github: '#',
      slides: [
        '<i data-feather="message-circle" class="w-16 h-16 text-purple-400"></i>',
        '<i data-feather="cpu" class="w-16 h-16 text-pink-400"></i>',
        '<i data-feather="image" class="w-16 h-16 text-cyan-400"></i>'
      ],
      bg: 'from-purple-500/20 to-pink-500/20'
    },
    'task-manager': {
      title: 'Task Manager Application',
      overview: 'A comprehensive task management system built with Java backend and MySQL database, featuring full CRUD operations and modern UI design.',
      technologies: ['Java (Spring Boot)', 'MySQL Database', 'JDBC/Hibernate', 'REST API'],
      features: ['Complete CRUD Operations', 'User Authentication', 'Task Categories & Priorities', 'Data Persistence'],
      liveDemo: '#',
      github: '#',
      slides: [
        '<i data-feather="check-square" class="w-16 h-16 text-pink-400"></i>',
        '<i data-feather="database" class="w-16 h-16 text-purple-400"></i>',
        '<i data-feather="layers" class="w-16 h-16 text-cyan-400"></i>'
      ],
      bg: 'from-pink-500/20 to-purple-500/20'
    }
  };

  const project = projectMap[projectType];
  if (!project) return;

  modalTitle.textContent = project.title;

  const slides = project.slides.map((slide, idx) => `
    <div class="modal-slide ${idx === 0 ? '' : 'hidden'} aspect-video bg-gradient-to-br ${project.bg} rounded-lg flex items-center justify-center" data-slide="${idx}">
      ${slide}
    </div>
  `).join('');

  modalContent.innerHTML = `
    <div class="space-y-6">
      <div class="space-y-3">
        <div id="modalCarousel" class="space-y-2">
          ${slides}
        </div>
        <div class="flex justify-center gap-2">
          <button class="quick-question-btn" id="prevSlideBtn">Prev</button>
          <button class="quick-question-btn" id="nextSlideBtn">Next</button>
        </div>
      </div>
      <div>
        <h4 class="text-xl font-bold text-white mb-3">Project Overview</h4>
        <p class="text-gray-300 mb-4">${project.overview}</p>
        <div class="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <h5 class="font-semibold text-purple-300 mb-2">Technologies Used</h5>
            <ul class="text-sm text-gray-300 space-y-1">${project.technologies.map((tech) => `<li>• ${tech}</li>`).join('')}</ul>
          </div>
          <div>
            <h5 class="font-semibold text-purple-300 mb-2">Key Features</h5>
            <ul class="text-sm text-gray-300 space-y-1">${project.features.map((feature) => `<li>• ${feature}</li>`).join('')}</ul>
          </div>
        </div>
        <div class="flex gap-3">
          <a href="${project.liveDemo}" class="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 rounded-lg text-white font-medium hover:shadow-lg transition-all">
            <i data-feather="external-link" class="w-4 h-4"></i>
            Live Demo
          </a>
          <a href="${project.github}" class="inline-flex items-center gap-2 glass-card px-4 py-2 text-purple-300 hover:text-pink-400 transition-colors">
            <i data-feather="github" class="w-4 h-4"></i>
            Source Code
          </a>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
  feather.replace();

  let activeSlide = 0;
  const slideEls = modalContent.querySelectorAll('[data-slide]');
  const showSlide = (nextIdx) => {
    activeSlide = (nextIdx + slideEls.length) % slideEls.length;
    slideEls.forEach((slide, idx) => slide.classList.toggle('hidden', idx !== activeSlide));
  };

  const prevSlideBtn = document.getElementById('prevSlideBtn');
  const nextSlideBtn = document.getElementById('nextSlideBtn');
  if (prevSlideBtn) prevSlideBtn.addEventListener('click', () => showSlide(activeSlide - 1));
  if (nextSlideBtn) nextSlideBtn.addEventListener('click', () => showSlide(activeSlide + 1));
}

function closeProjectModal() {
  const modal = document.getElementById('projectModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto';
}

// Theme Toggle
function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  const icon = themeToggle.querySelector('i');

  if (isLight) {
    icon.setAttribute('data-feather', 'moon');
    localStorage.setItem('theme', 'light');
  } else {
    icon.setAttribute('data-feather', 'sun');
    localStorage.setItem('theme', 'dark');
  }

  feather.replace();
}

// Navigation Highlighting
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.pageYOffset;

  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute('id');

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });
      const activeLink = document.querySelector(`.nav-link[href*=${sectionId}]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  mobileNav.classList.toggle('hidden');
}

function filterJourney(type) {
  journeyCards.forEach((card) => {
    const shouldShow = type === 'all' || card.dataset.type === type;
    card.classList.toggle('hidden', !shouldShow);
  });
}

function animateCount(el) {
  const target = Number(el.dataset.count || 0);
  const duration = 900;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = String(Math.floor(progress * target));
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = String(target);
    }
  }

  requestAnimationFrame(update);
}

function initJourneyCounters() {
  if (!journeyStatSection) return;
  const counters = journeyStatSection.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        counters.forEach((counter) => animateCount(counter));
        obs.disconnect();
      }
    });
  }, { threshold: 0.45 });

  observer.observe(journeyStatSection);
}

function copyEmailAddress() {
  const email = 'wkaveesha2004@gmail.com';
  navigator.clipboard.writeText(email)
    .then(() => {
      if (copyEmailBtn) {
        copyEmailBtn.classList.add('tool-btn-success');
        copyEmailBtn.querySelector('span').textContent = 'Copied';
        setTimeout(() => {
          copyEmailBtn.classList.remove('tool-btn-success');
          copyEmailBtn.querySelector('span').textContent = 'Email';
        }, 1300);
      }
    })
    .catch(() => {
      // Silent fallback for browsers that block clipboard in insecure contexts.
    });
}

function toggleFocusMode() {
  document.body.classList.toggle('focus-mode');
  if (!focusModeBtn) return;
  const active = document.body.classList.contains('focus-mode');
  focusModeBtn.querySelector('span').textContent = active ? 'Normal' : 'Focus';
}

function handleScrollTopVisibility() {
  if (!scrollTopBtn) return;
  if (window.scrollY > 320) {
    scrollTopBtn.classList.add('show-tool-btn');
  } else {
    scrollTopBtn.classList.remove('show-tool-btn');
  }
}

function updateScrollProgress() {
  if (!scrollProgressBar) return;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
  scrollProgressBar.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
}

function initSectionReveal() {
  const sections = document.querySelectorAll('main section');
  sections.forEach((section) => section.classList.add('skeleton-loading'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        setTimeout(() => entry.target.classList.remove('skeleton-loading'), 280);
      }
    });
  }, { threshold: 0.15 });

  sections.forEach((section) => revealObserver.observe(section));
}

function initParallaxHero() {
  const nodes = document.querySelectorAll('.parallax-node');
  if (!nodes.length) return;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    nodes.forEach((node) => {
      const depth = Number(node.getAttribute('data-parallax') || 0.2);
      node.style.transform = `translateY(${scrollY * depth}px)`;
    });
  });
}

function applyProjectFilterAndSearch() {
  const term = (projectSearch?.value || '').toLowerCase().trim();
  projectCards.forEach((card) => {
    const categories = (card.dataset.category || '').toLowerCase();
    const searchData = (card.dataset.search || '').toLowerCase();
    const filterMatch = selectedProjectFilter === 'all' || categories.includes(selectedProjectFilter);
    const searchMatch = !term || searchData.includes(term);
    card.classList.toggle('hidden', !(filterMatch && searchMatch));
  });
}

function handleImageUpload(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => {
    addMessageToChat('user', String(reader.result), { isImage: true });
    askAI('Please describe this image and suggest how it can improve my portfolio.');
  };
  reader.readAsDataURL(file);
}

function initSkillEnhancements() {
  document.querySelectorAll('.skill-item').forEach((item) => {
    const labelEl = item.querySelector('span');
    if (!labelEl) return;
    const label = labelEl.textContent?.trim() || 'Skill';
    labelEl.classList.add('inline-flex', 'items-center', 'gap-2');
    const icon = document.createElement('i');
    icon.setAttribute('data-feather', 'zap');
    icon.className = 'w-3 h-3 text-pink-400';
    labelEl.prepend(icon);
  });

  const ringCards = document.querySelectorAll('.skill-ring-card');
  const ringObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const ring = entry.target.querySelector('.skill-ring');
      const target = Number(entry.target.getAttribute('data-percent') || '0');
      let current = 0;
      const timer = setInterval(() => {
        current += 2;
        ring?.style.setProperty('--p', String(Math.min(current, target)));
        const label = ring?.querySelector('span');
        if (label) label.textContent = `${Math.min(current, target)}%`;
        if (current >= target) clearInterval(timer);
      }, 18);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.35 });

  ringCards.forEach((card) => ringObserver.observe(card));
}

function initTerminalMode() {
  const commandHandlers = {
    about: () => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' }),
    projects: () => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }),
    skills: () => document.querySelector('#skills')?.scrollIntoView({ behavior: 'smooth' }),
    services: () => document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' }),
    help: () => addTerminalLine('Commands: about, projects, skills, services, help, clear'),
    clear: () => { if (terminalOutput) terminalOutput.innerHTML = ''; }
  };

  const runCommand = (cmd) => {
    const normalized = cmd.trim().toLowerCase();
    if (!normalized) return;
    addTerminalLine(`> ${normalized}`);
    const handler = commandHandlers[normalized];
    if (handler) {
      handler();
      if (normalized !== 'help' && normalized !== 'clear') {
        addTerminalLine(`Navigated to ${normalized}`);
      }
    } else {
      addTerminalLine('Unknown command. Type help.');
    }
  };

  if (terminalModeBtn) {
    terminalModeBtn.addEventListener('click', () => {
      terminalPanel?.classList.toggle('hidden');
      if (!terminalPanel?.classList.contains('hidden')) terminalInput?.focus();
    });
  }
  if (closeTerminalBtn) closeTerminalBtn.addEventListener('click', () => terminalPanel?.classList.add('hidden'));
  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        runCommand(terminalInput.value);
        terminalInput.value = '';
      }
    });
  }
}

function addTerminalLine(text) {
  if (!terminalOutput) return;
  const line = document.createElement('p');
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function initVisitorCounter() {
  if (!visitorCounter) return;
  const key = 'portfolioVisits';
  const nextCount = Number(localStorage.getItem(key) || '0') + 1;
  localStorage.setItem(key, String(nextCount));
  visitorCounter.textContent = `Visits: ${nextCount}`;
}

function initEasterEgg() {
  const target = 'kaveesha';
  document.addEventListener('keydown', (e) => {
    easterBuffer = (easterBuffer + e.key.toLowerCase()).slice(-target.length);
    if (easterBuffer === target) {
      easterEgg?.classList.remove('hidden');
      setTimeout(() => easterEgg?.classList.add('hidden'), 1800);
    }
  });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize typewriter
  setTimeout(typeWriter, 1000);

  document.body.classList.add('page-ready');

  // Load chat history
  chatHistory.forEach(message => {
    addMessageToChat(message.role, message.content, { timestamp: message.timestamp || formatMessageTime(new Date()) });
  });

  // Load theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeToggle.querySelector('i').setAttribute('data-feather', 'moon');
  }

  // Fetch GitHub repos
  fetchGitHubRepos();

  initSectionReveal();
  initParallaxHero();
  initSkillEnhancements();
  initTerminalMode();
  initVisitorCounter();
  initEasterEgg();
  updateScrollProgress();

  document.querySelectorAll('img').forEach((img) => img.setAttribute('loading', 'lazy'));

  // Init interactive journey features
  initJourneyCounters();

  journeyFilters.forEach((filterBtn) => {
    filterBtn.addEventListener('click', () => {
      journeyFilters.forEach((btn) => btn.classList.remove('active'));
      filterBtn.classList.add('active');
      filterJourney(filterBtn.dataset.filter || 'all');
    });
  });

  projectFilters.forEach((btn) => {
    btn.addEventListener('click', () => {
      projectFilters.forEach((f) => f.classList.remove('active'));
      btn.classList.add('active');
      selectedProjectFilter = btn.dataset.filter || 'all';
      applyProjectFilterAndSearch();
    });
  });

  if (projectSearch) {
    projectSearch.addEventListener('input', applyProjectFilterAndSearch);
  }

  if (repoSort) {
    repoSort.addEventListener('change', () => {
      repoSortMode = repoSort.value;
      fetchGitHubRepos();
    });
  }

  quickQuestionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.question || '';
      aiInput.value = preset;
      askAI(preset);
    });
  });

  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      chatHistory = [];
      localStorage.removeItem('chatHistory');
      chatContainer.innerHTML = '';
      addMessageToChat('assistant', "Chat history cleared. How can I help you next?", { typing: true });
    });
  }

  if (imageDropZone && imageUploadInput) {
    imageDropZone.addEventListener('click', () => imageUploadInput.click());
    imageDropZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        imageUploadInput.click();
      }
    });
    imageUploadInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      handleImageUpload(file);
      imageUploadInput.value = '';
    });
    imageDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      imageDropZone.classList.add('drag-over');
    });
    imageDropZone.addEventListener('dragleave', () => imageDropZone.classList.remove('drag-over'));
    imageDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      imageDropZone.classList.remove('drag-over');
      handleImageUpload(e.dataTransfer?.files?.[0]);
    });
  }

  // Initialize Feather icons
  feather.replace();

  // Hide loader
  setTimeout(() => {
    if (pageLoader) {
      pageLoader.style.opacity = '0';
      setTimeout(() => pageLoader.remove(), 500);
    }
  }, 500);
});

// Chat input handlers
askBtn.addEventListener('click', () => askAI(aiInput.value));
aiInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') askAI(aiInput.value);
});

// Other event listeners
mobileMenuBtn.addEventListener('click', toggleMobileMenu);
themeToggle.addEventListener('click', toggleTheme);
window.addEventListener('scroll', updateActiveNav);
window.addEventListener('scroll', handleScrollTopVisibility);
window.addEventListener('scroll', updateScrollProgress);

if (copyEmailBtn) copyEmailBtn.addEventListener('click', copyEmailAddress);
if (focusModeBtn) focusModeBtn.addEventListener('click', toggleFocusMode);
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Close modal when clicking outside
projectModal.addEventListener('click', (e) => {
  if (e.target === projectModal) closeProjectModal();
});

// Smooth scrolling for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    if (this.getAttribute('href') === '#') {
      return;
    }
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    // Close mobile menu if open
    mobileNav.classList.add('hidden');
  });
});

// Animate skill bars on scroll
const observerOptions = {
  threshold: 0.5,
  rootMargin: '0px 0px -50px 0px'
};

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fills = entry.target.querySelectorAll('.skill-fill');
      fills.forEach(fill => {
        const width = fill.style.width;
        fill.style.width = '0';
        setTimeout(() => {
          fill.style.width = width;
        }, 200);
      });
    }
  });
}, observerOptions);

document.querySelectorAll('.skill-item').forEach(item => {
  skillObserver.observe(item);
});

