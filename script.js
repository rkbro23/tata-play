document.addEventListener("DOMContentLoaded", () => {
    let channels = [];
    let currentChannel = null;
    
    // DOM Elements
    const searchInput = document.getElementById("search");
    const clearSearchBtn = document.getElementById("clear-search");
    const channelGrid = document.getElementById("channelGrid");
    const emptyState = document.getElementById("emptyState");
    const playerWrapper = document.getElementById("playerWrapper");
    const videoPlayer = document.getElementById("videoPlayer");
    const nowPlaying = document.getElementById("now-playing");
    const channelName = document.getElementById("channel-name");
    const channelMeta = document.getElementById("channel-meta");
    const themeToggle = document.getElementById("theme-toggle");
    const refreshBtn = document.getElementById("refresh");
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const playerTime = document.getElementById("player-time");
  
    // Initialize
    init();
  
    async function init() {
      await loadChannels();
      setupEventListeners();
      checkThemePreference();
    }
  
    function checkThemePreference() {
      // Default to light mode, only switch to dark if previously selected
      if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add("dark-mode");
        updateThemeIcon(true);
      }
    }
  
    async function loadChannels() {
      try {
        const response = await fetch('channels.json');
        if (!response.ok) throw new Error('Failed to load channels');
        channels = await response.json();
        renderChannels(channels);
        renderFilters();
      } catch (error) {
        console.error('Error loading channels:', error);
        showErrorState();
      }
    }
  
    function renderFilters() {
      const categories = new Set();
      const languages = new Set();
      const genres = new Set();
  
      channels.forEach(ch => {
        if (ch.category) categories.add(ch.category);
        if (ch.language) languages.add(ch.language);
        if (ch.genre) genres.add(ch.genre);
      });
  
      fillSelect("categoryFilter", categories);
      fillSelect("languageFilter", languages);
      fillSelect("genreFilter", genres);
    }
  
    function fillSelect(id, values) {
      const select = document.getElementById(id);
      Array.from(values).sort().forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }
  
    function renderChannels(list) {
      channelGrid.innerHTML = '';
      
      if (list.length === 0) {
        emptyState.style.display = 'flex';
        return;
      }
      
      emptyState.style.display = 'none';
      
      list.forEach(channel => {
        const card = document.createElement("div");
        card.className = "card";
        
        const title = document.createElement("h3");
        title.textContent = channel.name;
        
        const meta = document.createElement("span");
        meta.textContent = [channel.category, channel.language].filter(Boolean).join(' • ') || 'Uncategorized';
        
        card.appendChild(title);
        card.appendChild(meta);
        
        card.addEventListener("click", () => playChannel(channel));
        channelGrid.appendChild(card);
      });
    }
  
    function playChannel(channel) {
      currentChannel = channel;
      updatePlayerInfo(channel);
      
      playerWrapper.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      videoPlayer.src = channel.url;
      videoPlayer.load();
      
      videoPlayer.play().catch(e => {
        console.error("Autoplay failed:", e);
      });
    }
  
    function updatePlayerInfo(channel) {
      nowPlaying.textContent = `Now Playing: ${channel.name}`;
      channelName.textContent = channel.name;
      channelMeta.textContent = [channel.category, channel.language].filter(Boolean).join(' • ') || 'No info';
    }
  
    function closePlayer() {
      playerWrapper.style.display = 'none';
      document.body.style.overflow = '';
      videoPlayer.pause();
      videoPlayer.src = '';
      currentChannel = null;
    }
  
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
          // Try to make the player box fullscreen first
          if (playerWrapper.requestFullscreen) {
            playerWrapper.requestFullscreen();
          } else if (playerWrapper.webkitRequestFullscreen) { /* Safari */
            playerWrapper.webkitRequestFullscreen();
          } else if (playerWrapper.msRequestFullscreen) { /* IE11 */
            playerWrapper.msRequestFullscreen();
          }
          
          // Update fullscreen button icon
          fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
          // Exit fullscreen
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
          }
          
          // Update fullscreen button icon
          fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
      }
      
      function closePlayer() {
        // First exit fullscreen if active
        if (document.fullscreenElement) {
          if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
              hidePlayer();
            });
          } else {
            hidePlayer();
          }
        } else {
          hidePlayer();
        }
      }
      
      function hidePlayer() {
        playerWrapper.style.display = 'none';
        document.body.style.overflow = '';
        videoPlayer.pause();
        videoPlayer.src = '';
        currentChannel = null;
        
        // Reset fullscreen button icon if needed
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
      }
      
      // Add fullscreen change listener
      document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
          fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
      });
      
      // Update setupEventListeners to use proper close function
      function setupEventListeners() {
          // Update close player event listeners
  document.querySelector('.close-player').addEventListener('click', closePlayer);
  document.getElementById("playerOverlay").addEventListener("click", closePlayer);
      // Search functionality
      searchInput.addEventListener("input", () => {
        filterChannels();
        clearSearchBtn.style.display = searchInput.value ? 'block' : 'none';
      });
      
      clearSearchBtn.addEventListener("click", () => {
        searchInput.value = '';
        filterChannels();
        clearSearchBtn.style.display = 'none';
        searchInput.focus();
      });
      
      // Filter functionality
      document.getElementById("categoryFilter").addEventListener("change", filterChannels);
      document.getElementById("languageFilter").addEventListener("change", filterChannels);
      document.getElementById("genreFilter").addEventListener("change", filterChannels);
      
      // Theme toggle
      themeToggle.addEventListener("click", toggleTheme);
      
      // Refresh button
      refreshBtn.addEventListener("click", () => {
        channelGrid.innerHTML = '<div class="skeleton-card"></div>'.repeat(8);
        loadChannels();
      });
      
      // Fullscreen button
      fullscreenBtn.addEventListener("click", toggleFullscreen);
      
      // Close player when clicking overlay
      document.getElementById("playerOverlay").addEventListener("click", closePlayer);
      
      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        if (e.key === 'Escape' && playerWrapper.style.display === 'flex') {
          closePlayer();
        }
      });
      
      // Video player events
      videoPlayer.addEventListener("timeupdate", updateTimeDisplay);
      videoPlayer.addEventListener("loadedmetadata", updateTimeDisplay);
    }
  
    function filterChannels() {
      const searchTerm = searchInput.value.toLowerCase();
      const category = document.getElementById("categoryFilter").value;
      const language = document.getElementById("languageFilter").value;
      const genre = document.getElementById("genreFilter").value;
      
      const filtered = channels.filter(channel => {
        const matchesSearch = channel.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || channel.category === category;
        const matchesLanguage = !language || channel.language === language;
        const matchesGenre = !genre || channel.genre === genre;
        
        return matchesSearch && matchesCategory && matchesLanguage && matchesGenre;
      });
      
      renderChannels(filtered);
    }
  
    function toggleTheme() {
      const isDark = !document.body.classList.contains("dark-mode");
      document.body.classList.toggle("dark-mode", isDark);
      updateThemeIcon(isDark);
      localStorage.setItem('darkMode', isDark);
    }
  
    function updateThemeIcon(isDark) {
      const icon = themeToggle.querySelector("i");
      icon.classList.toggle("fa-moon", !isDark);
      icon.classList.toggle("fa-sun", isDark);
    }
  
    function showErrorState() {
      channelGrid.innerHTML = '';
      emptyState.style.display = 'flex';
      emptyState.querySelector('h3').textContent = 'Failed to load channels';
      emptyState.querySelector('p').textContent = 'Please try refreshing the page';
    }
  
    // Global function for closing player
    window.closePlayer = closePlayer;
  });
