let sidebar = document.querySelector(".sidebar");
let sidebarOverlay = document.querySelector(".sidebar-overlay");
let menuIcon = document.querySelector(".menu-icon");
let closeIcon = document.querySelector(".close-icon");
let ip = document.querySelectorAll(".ip");
let statusOnline = document.querySelector("#status-online");
let statusOffline = document.querySelector("#status-offline");
let playerCount = document.querySelector(".player-count")
let sidebarList = document.querySelectorAll(".sidebar-list")

const api = "https://api.mcstatus.io/v2/status/java/play.horizion.in:25565"

window.onload = () => {
      // Start with sidebar hidden (translated off-screen)
      sidebar.classList.add('translate-x-full');
      
      // Store page - Tab switching and payment
      if (document.getElementById('tab-ranks')) {
            // Tab switching functionality
            const tabRanks = document.getElementById('tab-ranks');
            const tabCrateKeys = document.getElementById('tab-crate-keys');
            const ranksSection = document.getElementById('ranks-section');
            const crateKeysSection = document.getElementById('crate-keys-section');
            
            // Show Ranks tab by default
            tabRanks.addEventListener('click', () => {
                  // Update active tab styling
                  tabRanks.classList.add('bg-indigo-600');
                  tabRanks.classList.remove('text-gray-300', 'hover:text-white');
                  tabCrateKeys.classList.remove('bg-indigo-600');
                  tabCrateKeys.classList.add('text-gray-300', 'hover:text-white');
                  
                  // Show/hide appropriate sections
                  ranksSection.classList.remove('hidden');
                  crateKeysSection.classList.add('hidden');
            });
            
            // Show Crate Keys tab when clicked
            tabCrateKeys.addEventListener('click', () => {
                  // Update active tab styling
                  tabCrateKeys.classList.add('bg-indigo-600');
                  tabCrateKeys.classList.remove('text-gray-300', 'hover:text-white');
                  tabRanks.classList.remove('bg-indigo-600');
                  tabRanks.classList.add('text-gray-300', 'hover:text-white');
                  
                  // Show/hide appropriate sections
                  crateKeysSection.classList.remove('hidden');
                  crateKeysSection.classList.add('grid');
                  ranksSection.classList.add('hidden');
            });
            
            // Get all buy buttons (for ranks and crate keys)
            const buyButtons = document.querySelectorAll('[id^="buy-"]');
            
            // Add click listeners to all buy buttons
            buyButtons.forEach(button => {
                  button.addEventListener('click', async (e) => {
                        e.preventDefault();
                        
                        // Get product details from data attributes
                        const productName = button.dataset.name;
                        const serviceId = button.dataset.serviceId; // Get service ID
                        
                        // Provide a default customer name if not set
                        const customerName = "Minecraft Player";
                        const customerEmail = "";
                        
                        try {
                              // Call the payment function from payment.js (amount will be determined by serviceId)
                              await initiatePayment(null, customerName, customerEmail, serviceId);
                        } catch (error) {
                              console.error("Payment initialization failed:", error);
                              alert("Payment could not be initiated. Please try again later.");
                        }
                  });
            });
      }
      closeIcon.style.removeProperty('display');
      closeIcon.style.display = "none";
      updateStatusOnline();
};

// side menu toogle

menuIcon.onclick = () => {
      // Slide sidebar in from right
      sidebar.classList.remove('translate-x-full');
      sidebar.classList.add('translate-x-0');
      
      // Show overlay and block all interactions
      sidebarOverlay.classList.remove('opacity-0', 'pointer-events-none');
      sidebarOverlay.classList.add('opacity-100', 'pointer-events-auto');
      
      // Prevent body scrolling when sidebar is open
      document.body.style.overflow = 'hidden';
      
      closeIcon.style.removeProperty('display');
};

closeIcon.onclick = () => {
      closeSidebar();
};

// Function to close sidebar
function closeSidebar() {
      // Slide sidebar out to right
      sidebar.classList.remove('translate-x-0');
      sidebar.classList.add('translate-x-full');
      
      // Hide overlay and restore interactions
      sidebarOverlay.classList.remove('opacity-100', 'pointer-events-auto');
      sidebarOverlay.classList.add('opacity-0', 'pointer-events-none');
      
      // Restore body scrolling
      document.body.style.overflow = '';
      
      closeIcon.style.removeProperty('display');
      closeIcon.style.display = "none";
}

// Close sidebar when clicking on overlay
sidebarOverlay.onclick = () => {
      closeSidebar();
};

// Prevent sidebar clicks from closing the sidebar
sidebar.onclick = (e) => {
      e.stopPropagation();
};

sidebarList.forEach((click) => {
      click.addEventListener("click", () => {
            closeSidebar();
      });
      
});

// ip copy button

// Add hover effects to IP buttons
ip.forEach((button) => {
      // Add pulse effect on hover
      button.addEventListener('mouseenter', () => {
            button.classList.add('hover:shadow-md', 'hover:brightness-110');
      });
      
      // Add click ripple effect
      button.addEventListener('click', (e) => {
            // Ensure button has correct styling
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            
            // Copy IP address
            navigator.clipboard.writeText("play.horizion.in");
            
            // Create popup with SVG icon inline
            const popup = document.createElement('div');
            popup.innerHTML = '<svg class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>IP Copied';
            
            // Style the popup - position it on the right side of the screen
            popup.className = 'fixed top-20 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50 font-medium text-sm animate-slideIn flex items-center';
            
            // Remove any existing popups
            const existingPopup = document.querySelector('.ip-copied-popup');
            if (existingPopup) {
                  document.body.removeChild(existingPopup);
            }
            
            // Add class for easier selection
            popup.classList.add('ip-copied-popup');
            
            // Add to body
            document.body.appendChild(popup);
            
            // Trigger animation
            setTimeout(() => {
                  popup.style.opacity = '1';
            }, 10);
            
            // Remove after 2 seconds
            setTimeout(() => {
                  popup.classList.add('animate-slideOut');
                  setTimeout(() => {
                        if (document.body.contains(popup)) {
                              document.body.removeChild(popup);
                        }
                  }, 300);
            }, 2000);
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


