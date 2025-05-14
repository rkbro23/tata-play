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

  function applyFilters() {
    const q = document.getElementById("search").value.toLowerCase();
    const cat = document.getElementById("categoryFilter").value;
    const lang = document.getElementById("languageFilter").value;
    const genre = document.getElementById("genreFilter").value;

    const filtered = channels.filter(ch =>
      (!q || ch.name.toLowerCase().includes(q)) &&
      (!cat || ch.category === cat) &&
      (!lang || ch.language === lang) &&
      (!genre || ch.genre === genre)
    );

    renderChannels(filtered);
  }

function playChannel(url) {
  const wrapper = document.getElementById("playerWrapper");

  const oldPlayer = document.getElementById("videoPlayer");
  const newPlayer = oldPlayer.cloneNode(true);
  oldPlayer.parentNode.replaceChild(newPlayer, oldPlayer);

  newPlayer.src = "";
  newPlayer.load();

  if (url.includes(".mpd")) {
    const dash = dashjs.MediaPlayer().create();
    dash.initialize(newPlayer, url, true);
  } else if (url.includes(".m3u8")) {
    newPlayer.src = url;
    newPlayer.type = "application/x-mpegURL"; // This is important for m3u8 streams
    newPlayer.load();
  } else if (url.includes("php?id=") || url.includes("m3u8?id=")) {
    // Handle php?id= and m3u8?id= streams by redirecting or fetching the actual stream URL
    fetch(url)
      .then(res => res.text())
      .then(resText => {
        // Assuming the response text contains a valid stream URL
        const streamUrl = resText.trim();  // Make sure to extract the URL properly from the response
        newPlayer.src = streamUrl;
        newPlayer.load();
      })
      .catch(err => console.error("Error fetching stream URL:", err));
  } else {
    // If it's a direct URL or other format
    newPlayer.src = url;
    newPlayer.load();
  }

  wrapper.classList.add("show");
}

  window.closePlayer = () => {
    const wrapper = document.getElementById("playerWrapper");
    const player = document.getElementById("videoPlayer");
    wrapper.classList.remove("show");
    player.pause();
    player.src = "";
  };

  // Event Listeners
  document.getElementById("search").addEventListener("input", applyFilters);
  document.getElementById("categoryFilter").addEventListener("change", applyFilters);
  document.getElementById("languageFilter").addEventListener("change", applyFilters);
  document.getElementById("genreFilter").addEventListener("change", applyFilters);
  document.getElementById("refresh").addEventListener("click", () => {
    fetchChannels();
    document.getElementById("search").value = "";
    ["categoryFilter", "languageFilter", "genreFilter"].forEach(id => {
      document.getElementById(id).value = "";
    });
  });

  fetchChannels();
});
