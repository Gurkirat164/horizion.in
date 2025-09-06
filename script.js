let dropdown = document.querySelector(".dropdown");
let menuIcon = document.querySelector(".menu-icon");
let closeIcon = document.querySelector(".close-icon");
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
      closeIcon.style.removeProperty('display');
      closeIcon.style.display = "none";
};

// side menu toogle

menuIcon.onclick = () => {
      dropdown.style.removeProperty('display');
      dropdown.style.display = "block";
      
      closeIcon.style.removeProperty('display');
      menuIcon.style.removeProperty('display');
      menuIcon.style.display = "none";
};

closeIcon.onclick = () => {
      dropdown.style.removeProperty('display');
      dropdown.style.display = "none";
      
      menuIcon.style.removeProperty('display');
      closeIcon.style.removeProperty('display');
      closeIcon.style.display = "none";
};

// menuIcon.onclick = () => {
//       if(menuHidden) {
//             dropdown.style.removeProperty('display');
//             dropdown.style.display = "none";
//             menuHidden = false;
//       }
//       else {
//             dropdown.style.removeProperty('display');
//             dropdown.style.display = "block";
//             menuHidden = true;
//       }
// };

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

updatePlayerCount();

setInterval(updatePlayerCount, 60000);