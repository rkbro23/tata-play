document.addEventListener("DOMContentLoaded", () => {
  let channels = [];

  async function fetchChannels() {
    try {
      const res = await fetch("channels.json");
      channels = await res.json();
      renderFilters();
      renderChannels(channels);
    } catch (err) {
      console.error("Error loading channels:", err);
    }
  }

  function renderFilters() {
    const catSet = new Set();
    const langSet = new Set();
    const genreSet = new Set();

    channels.forEach(ch => {
      if (ch.category) catSet.add(ch.category);
      if (ch.language) langSet.add(ch.language);
      if (ch.genre) genreSet.add(ch.genre);
    });

    fillSelect("categoryFilter", catSet);
    fillSelect("languageFilter", langSet);
    fillSelect("genreFilter", genreSet);
  }

  function fillSelect(id, values) {
    const sel = document.getElementById(id);
    sel.innerHTML = '<option value="">-- Select --</option>'; // Reset options
    values.forEach(val => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = val;
      sel.appendChild(opt);
    });
  }

  function renderChannels(list) {
    const grid = document.getElementById("channelGrid");
    grid.innerHTML = "";
    list.forEach(channel => {
      const card = document.createElement("div");
      card.className = "card";
      const logoUrl = getLogoUrl(channel.name);
      card.innerHTML = `
        <img src="${logoUrl}" alt="${channel.name}">
        <h3>${channel.name}</h3>
        <span>${channel.category || 'Uncategorized'}</span>
      `;
      card.onclick = () => playChannel(channel.url);
      grid.appendChild(card);
    });
  }

  function getLogoUrl(channelName) {
    const formattedName = channelName.replace(/\s+/g, '_').toLowerCase();
    return `https://raw.githubusercontent.com/amjiddader/tv_logo/master/${formattedName}.png`;
  }

  function playChannel(url) {
    const wrapper = document.getElementById("playerWrapper");
    const player = document.getElementById("videoPlayer");

    if (url.includes(".mpd")) {
      const dash = dashjs.MediaPlayer().create();
      dash.initialize(player, url, true);
    } else if (url.includes(".m3u8")) {
      player.src = url;
      player.type = "application/x-mpegURL"; // For m3u8 streams
      player.load();
    } else {
      player.src = url;
      player.load();
    }

    wrapper.classList.add("show");
  }

  window.closePlayer = () => {
    const wrapper = document.getElementById("playerWrapper");
    const player = document.getElementById("videoPlayer");
    wrapper.classList.remove("show");
    player.pause();
    player.src = ""; // Clear the source
  };

  document.getElementById("refresh").addEventListener("click", fetchChannels);
  document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });

  fetchChannels();
});
