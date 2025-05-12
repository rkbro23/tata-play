const channelGrid = document.getElementById('channelGrid');
const videoPlayer = document.getElementById('videoPlayer');
const playerWrapper = document.getElementById('playerWrapper');

fetch('channels.json')
  .then(res => res.json())
  .then(data => {
    renderChannels(data);
    setupFilters(data);
    document.getElementById("search").addEventListener("input", e => {
      const query = e.target.value.toLowerCase();
      const filtered = data.filter(ch => ch.name.toLowerCase().includes(query));
      renderChannels(filtered);
    });
  });

function renderChannels(channels) {
  channelGrid.innerHTML = "";
  channels.forEach(ch => {
    const div = document.createElement("div");
    div.className = "channel";
    div.innerHTML = `
      <img src="${ch.logo}" alt="${ch.name}"/>
      <span>${ch.name}</span>
    `;
    div.onclick = () => playChannel(ch.url || ch.m3u8);
    channelGrid.appendChild(div);
  });
}

function playChannel(url) {
  if (Hls.isSupported() && url.includes(".m3u8")) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(videoPlayer);
  } else {
    videoPlayer.src = url;
  }
  playerWrapper.classList.add("show");
}

function closePlayer() {
  playerWrapper.classList.remove("show");
  videoPlayer.pause();
  videoPlayer.src = "";
}

function setupFilters(channels) {
  const categorySet = new Set();
  const languageSet = new Set();
  const qualitySet = new Set();

  channels.forEach(ch => {
    if (ch.category) categorySet.add(ch.category);
    if (ch.language) languageSet.add(ch.language);
    if (ch.quality) qualitySet.add(ch.quality);
  });

  fillFilter("categoryFilter", categorySet);
  fillFilter("languageFilter", languageSet);
  fillFilter("qualityFilter", qualitySet);

  document.querySelectorAll("#filters select").forEach(sel => {
    sel.addEventListener("change", () => {
      let filtered = channels;
      const cat = document.getElementById("categoryFilter").value;
      const lang = document.getElementById("languageFilter").value;
      const qual = document.getElementById("qualityFilter").value;
      if (cat) filtered = filtered.filter(c => c.category === cat);
      if (lang) filtered = filtered.filter(c => c.language === lang);
      if (qual) filtered = filtered.filter(c => c.quality === qual);
      renderChannels(filtered);
    });
  });
}

function fillFilter(id, values) {
  const select = document.getElementById(id);
  values.forEach(val => {
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = val;
    select.appendChild(opt);
  });
}

// Telegram popup
window.addEventListener("load", () => {
  const popup = document.getElementById("popup");
  const okBtn = document.getElementById("okBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  popup.style.display = "flex";

  okBtn.onclick = () => popup.style.display = "none";
  cancelBtn.onclick = () => popup.style.display = "none";
});
