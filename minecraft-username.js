/**
 * Simple Minecraft Username Collection Modal
 * Collects only the Minecraft username before payment
 */

// Function to show Minecraft username modal before payment
function showMinecraftUsernameModal(serviceData, paymentCallback) {
      // Create modal overlay
      const modalOverlay = document.createElement("div");
      modalOverlay.id = "minecraft-username-modal";
      modalOverlay.className =
            "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50";

      // Create modal content
      modalOverlay.innerHTML = `
        <div class="bg-gray-800 rounded-lg p-6 w-contain max-w-md mx-4 border border-gray-700">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold text-white">Enter Your Minecraft Username</h3>
                <button id="close-minecraft-modal" class="text-gray-400 hover:text-white">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="mb-4">
                <p class="text-gray-300 mb-2">Service: <span class="text-indigo-400 font-semibold">${
                      serviceData.name
                }</span></p>
                <p class="text-gray-300 mb-4">Price: <span class="text-green-400 font-semibold">₹${(
                      serviceData.price / 100
                ).toFixed(2)}</span></p>
            </div>
            
            <form id="minecraft-username-form" class="space-y-4">
                <div>
                    <label for="minecraft-username" class="block text-sm font-medium text-gray-300 mb-1">
                        Minecraft Username <span class="text-red-400">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="minecraft-username" 
                        name="minecraftUsername"
                        required
                        placeholder="Enter your Minecraft username"
                        class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                    <p class="text-xs text-gray-400 mt-1">This will be used to grant you the rank in-game</p>
                </div>
                
                <div>
                    <label class="flex items-center space-x-3">
                        <input 
                            type="checkbox" 
                            id="bedrock-user" 
                            name="bedrockUser"
                            class="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
                        >
                        <span class="text-sm text-gray-300">
                            I am a Bedrock Edition player
                        </span>
                    </label>
                    <p class="text-xs text-gray-400 mt-1 ml-7">Check this if you play on Mobile, Xbox, PlayStation, or Windows 10/11 Edition</p>
                </div>
                
                <div class="flex space-x-3 pt-4">
                    <button 
                        type="button" 
                        id="cancel-minecraft-payment" 
                        class="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 border-2 text-white rounded-md transition duration-200"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        class="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-md transition duration-200 font-semibold"
                    >
                        Continue to Payment
                    </button>
                </div>
            </form>
        </div>
    `;

      // Add modal to document
      document.body.appendChild(modalOverlay);

      // Focus on the username input
      document.getElementById("minecraft-username").focus();

      // Handle form submission
      document
            .getElementById("minecraft-username-form")
            .addEventListener("submit", (e) => {
                  e.preventDefault();

                  const minecraftUsername = document
                        .getElementById("minecraft-username")
                        .value.trim();
                  const isBedrockUser =
                        document.getElementById("bedrock-user").checked;

                  if (!minecraftUsername) {
                        alert("Please enter your Minecraft username");
                        return;
                  }

                  // Validate username format (basic validation)
                  if (
                        minecraftUsername.length < 3 ||
                        minecraftUsername.length > 16
                  ) {
                        alert(
                              "Minecraft username must be between 3 and 16 characters"
                        );
                        return;
                  }

                  // Remove modal
                  document.body.removeChild(modalOverlay);

                  // Call the payment function with Minecraft username and bedrock status
                  paymentCallback(minecraftUsername, isBedrockUser);
            });

      // Handle cancel/close
      const closeModal = () => {
            document.body.removeChild(modalOverlay);
      };

      document
            .getElementById("close-minecraft-modal")
            .addEventListener("click", closeModal);
      document
            .getElementById("cancel-minecraft-payment")
            .addEventListener("click", closeModal);

      // Close modal when clicking outside
      modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) {
                  closeModal();
            }
      });

      // Handle escape key
      const handleEscape = (e) => {
            if (e.key === "Escape") {
                  closeModal();
                  document.removeEventListener("keydown", handleEscape);
            }
      };
      document.addEventListener("keydown", handleEscape);
}

// Export for use in other files
if (typeof window !== "undefined") {
      window.showMinecraftUsernameModal = showMinecraftUsernameModal;
}
