let dropdown = document.querySelector(".dropdown");
let menu = document.querySelector(".menu-icon");
let ip = document.querySelectorAll(".ip");
let ping = document.querySelector(".ping");
let statusOnline = document.querySelector("#status-online");
let statusOffline = document.querySelector("#status-offline");
let playerCount = document.querySelector(".player-count")

const api = "https://api.mcstatus.io/v2/status/java/play.horizion.in:25565"


let menuHidden = false;

window.onload = () => {
      dropdown.style.removeProperty('display');
      dropdown.style.display = "none";
      menuHidden = false;
      updatePlayerCount();
};

menu.onclick = () => {
      if(menuHidden) {
            dropdown.style.removeProperty('display');
            ping.style.removeProperty('display');
            dropdown.style.display = "none";
            menuHidden = false;
      }
      else {
            dropdown.style.removeProperty('display');
            ping.style.removeProperty('display');
            dropdown.style.display = "block";
            ping.style.display = "none";
            menuHidden = true;
      }
};

ip.forEach((click) => {
      click.addEventListener("click", () => {
            navigator.clipboard.writeText("play.horizion.in")
      });
      
});

async function updatePlayerCount() {
      const pc = await fetch(api)
      const data = await pc.json();
      const status = data.online
      const players = data.players.online

      if(status) {
            statusOnline.style.removeProperty('display');
            statusOffline.style.removeProperty('display');
            statusOnline.style.display = "flex";
            statusOffline.style.display = "none";
            playerCount.innerText = players + " Online Players"; 
      }
      else {
            statusOnline.style.removeProperty('display');
            statusOffline.style.removeProperty('display');
            statusOnline.style.display = "none";
            statusOffline.style.display = "flex";
            playerCount.innerText = "Server Offline"; 
      }

}


// async function updatePlayerCount() {
//   try {
//     const res = await fetch(
//       "https://api.mcstatus.io/v2/status/java/play.bitcraftnetwork.fun"
//     );
//     if (!res.ok) throw new Error("Failed to fetch server status");
//     const data = await res.json();
//     const countEl = document.getElementById("player-count");
//     countEl.textContent = data.online ? data.players?.online ?? 0 : 0;
//   } catch (err) {
//     console.error(err);
//     document.getElementById("player-count").textContent = "0";
//   }
// }

// // Update on page load
// updatePlayerCount();

// // Refresh every 60 seconds
// setInterval(updatePlayerCount, 60000);


