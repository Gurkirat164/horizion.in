/**
 * Horizion Network Payment Integration
 * Production version
 */

// Configuration - Change this URL to switch between environments
// window.API_BASE_URL = 'https://horizion-in.onrender.com';
window.API_BASE_URL = 'http://localhost:3000';

// Function to create order and open Razorpay payment form
async function initiatePayment(amount, serviceId, minecraftUsername = null, isBedrockUser = false) {
  try {
    // Validate required parameters
    if (!serviceId) {
      alert('Service ID is required for payment processing');
      return;
    }

    // Step 1: Fetch service details
    const serviceResponse = await fetch(`${window.API_BASE_URL}/get-service-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId })
    });

    if (!serviceResponse.ok) throw new Error('Failed to fetch service data');
    const serviceData = await serviceResponse.json();

    if (serviceData.error) {
      alert(serviceData.error);
      return;
    }

    const { service_name, service_id, description, price } = serviceData;
    const finalAmount = price || amount; // Use price from service data if available
    
    if (!finalAmount) {
      alert('Unable to determine price for this service');
      return;
    }

    // Step 2: Create order on your server
    const orderResponse = await fetch(`${window.API_BASE_URL}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: finalAmount, // Amount in INR
      }),
    });

    if (!orderResponse.ok) throw new Error('Failed to create order');
    const orderData = await orderResponse.json();

    // Step 3: Get Razorpay Key from server
    const keyResponse = await fetch(`${window.API_BASE_URL}/get-razorpay-key`);
    if (!keyResponse.ok) throw new Error('Failed to get Razorpay key');
    const { key } = await keyResponse.json();

    // Step 4: Initialize Razorpay checkout
    const options = {
      key: key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Horizion Network',
      description: description || 'Premium Rank Purchase',
      image: './img/favicon.png', // URL of your logo
      order_id: orderData.id,
      
      // Notes to be saved with payment
      notes: {
        service_name: service_name,
        service_id: service_id,
        minecraft_username: minecraftUsername || 'Unknown Player',
        is_bedrock_user: isBedrockUser
      },
      
      // Theme
      theme: {
        color: '#2fa101'
      },
      
      handler: async function (response) {
        // Step 5: Verify payment with your server
        try {
          const verifyRequestBody = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            // Include service data for Discord notification
            serviceData: {
              service_name: service_name,
              price: finalAmount,
              service_id: service_id,
              description: description,
              minecraft_username: minecraftUsername || 'Unknown Player',
              is_bedrock_user: isBedrockUser
            }
          };

          const paymentVerifyResponse = await fetch(`${window.API_BASE_URL}/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(verifyRequestBody),
          });

          const paymentVerifyData = await paymentVerifyResponse.json();

          if (paymentVerifyData.success) {
            // Payment successful
            const successMsg = document.createElement('div');
            successMsg.style.position = 'fixed';
            successMsg.style.top = '50%';
            successMsg.style.left = '50%';
            successMsg.style.transform = 'translate(-50%, -50%)';
            successMsg.style.padding = '20px';
            successMsg.style.backgroundColor = '#22c55e';
            successMsg.style.color = 'white';
            successMsg.style.borderRadius = '8px';
            successMsg.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            successMsg.style.zIndex = '1000';
            successMsg.innerHTML = `
              <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Payment Successful!</h3>
              <p>Transaction ID: ${response.razorpay_payment_id}</p>
            `;
            document.body.appendChild(successMsg);
            // Optionally redirect after a delay
            // setTimeout(() => { window.location.href = "./index.html"; }, 3000);
          } else {
            const errorMessage = paymentVerifyData.message
              ? `Payment verification failed: ${paymentVerifyData.message}`
              : 'Payment verification failed. Please contact support with your payment ID: ' + response.razorpay_payment_id;
            alert(errorMessage);
          }
        } catch (verifyError) {
          alert('Error verifying payment. Please contact support with your payment ID: ' + response.razorpay_payment_id);
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

  } catch (error) {
    alert('Something went wrong. Please try again later.');
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const payButton = document.getElementById('pay-btn');
  if (payButton) {
    payButton.addEventListener('click', async (e) => {
      e.preventDefault();
      const serviceId = payButton.dataset.serviceId; // Get service ID from data attribute
      
      if (!serviceId) {
        alert('Service ID is required for payment processing');
        return;
      }
      
      // First get service data to show in Minecraft username modal
      try {
        const serviceResponse = await fetch(`${window.API_BASE_URL}/get-service-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serviceId })
        });

        if (!serviceResponse.ok) throw new Error('Failed to fetch service data');
        const serviceData = await serviceResponse.json();

        if (serviceData.error) {
          alert(serviceData.error);
          return;
        }

        // Show Minecraft username modal first
        showMinecraftUsernameModal({
          name: serviceData.service_name,
          price: serviceData.price
        }, async (minecraftUsername, isBedrockUser) => {
          // After getting Minecraft username and bedrock status, initiate payment
          await initiatePayment(null, serviceId, minecraftUsername, isBedrockUser);
        });
        
      } catch (error) {
        console.error('Failed to fetch service data:', error);
        // Fallback to payment without Minecraft username
        await initiatePayment(null, serviceId);
      }
    });
  }
});

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initiatePayment };
}