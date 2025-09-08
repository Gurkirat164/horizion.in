let sidebar = document.querySelector(".sidebar");
let menuIcon = document.querySelector(".menu-icon");
let closeIcon = document.querySelector(".close-icon");
let ip = document.querySelectorAll(".ip");
let ping = document.querySelector(".ping");
let statusOnline = document.querySelector("#status-online");
let statusOffline = document.querySelector("#status-offline");
let playerCount = document.querySelector(".player-count")
let body = document = document.querySelector(".body")

const api = "https://api.mcstatus.io/v2/status/java/play.horizion.in:25565"


let menuHidden = false;

window.onload = () => {
      // Start with sidebar hidden (translated off-screen)
      sidebar.classList.add('translate-x-full');
      menuHidden = false;
      closeIcon.style.removeProperty('display');
      closeIcon.style.display = "none";
      updateStatusOnline();
};

// side menu toogle

menuIcon.onclick = () => {
      // Slide sidebar in from right
      sidebar.classList.remove('translate-x-full');
      sidebar.classList.add('translate-x-0');

      // body.style.position = "relative";
      
      closeIcon.style.removeProperty('display');
      menuIcon.style.removeProperty('display');
      menuIcon.style.display = "none";
};

closeIcon.onclick = () => {
      // Slide sidebar out to right
      sidebar.classList.remove('translate-x-0');
      sidebar.classList.add('translate-x-full');
      
      menuIcon.style.removeProperty('display');
      closeIcon.style.removeProperty('display');
      closeIcon.style.display = "none";
};

// ip copy button

ip.forEach((click) => {
      click.addEventListener("click", () => {
            navigator.clipboard.writeText("play.horizion.in")
      });
      
});

// player count and status updater

async function updatePlayerCount() {
      const pc = await fetch(api)
      const data = await pc.json();
      const status = data.online
      const players = data.players.online

      statusOnline.style.removeProperty('display');
      statusOnline.style.display = "flex";

      if(status) {
            updateStatusOnline();
            playerCount.innerText = players + " Online Players"; 
      }
      else {
            setTimeout(() => {
                  updateStatusOffline();
                  playerCount.innerText = "Server Offline"; 
            }, 500);
      }

};

function updateStatusOnline() {
            statusOnline.style.removeProperty('display');
            statusOffline.style.removeProperty('display');
            statusOnline.style.display = "flex";
            statusOffline.style.display = "none";
};

function updateStatusOffline() {
            statusOnline.style.removeProperty('display');
            statusOffline.style.removeProperty('display');
            statusOnline.style.display = "none";
            statusOffline.style.display = "flex";
};

updatePlayerCount();

setInterval(updatePlayerCount, 60000);