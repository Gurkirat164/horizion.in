/**
 * Horizion Network Payment Integration
 * Production version
 */

// Function to create order and open Razorpay payment form
async function initiatePayment(amount, customerName, customerEmail) {
  try {
    // Step 1: Create order on your server
    const response = await fetch('http://localhost:3000/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount, // Amount in INR
      }),
    });
    
    const orderData = await response.json();
    
    // Step 2: Get Razorpay Key from server
    const keyResponse = await fetch('http://localhost:3000/get-razorpay-key');
    const { key } = await keyResponse.json();
    
    // Step 3: Initialize Razorpay checkout
    const options = {
      key: key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Horizion Network',
      description: 'Premium Rank Purchase',
      image: './img/favicon.png', // URL of your logo
      order_id: orderData.id,
      handler: async function (response) {
        // Step 4: Verify payment with your server
        try {
          const verifyRequestBody = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          };
          
          const paymentVerifyResponse = await fetch('http://localhost:3000/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(verifyRequestBody),
          });
          
          const paymentVerifyData = await paymentVerifyResponse.json();
          
          if (paymentVerifyData.success) {
            // Payment successful
            
            // Show success message
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
              <p>Transaction ID: ${response.razorpay_payment_id}</p>`
//              <p style="margin-top: 15px; font-size: 14px;">Redirecting to account page...</p>`
            ;
            document.body.appendChild(successMsg);
            
            // Redirect after a delay
            // setTimeout(() => {
            //   window.location.href = "./index.html";
            // }, 3000);
          } else {
            // Payment verification failed
            // Show detailed error message
            const errorMessage = paymentVerifyData.message 
              ? `Payment verification failed: ${paymentVerifyData.message}` 
              : 'Payment verification failed. Please contact support with your payment ID: ' + response.razorpay_payment_id;
            
            alert(errorMessage);
          }
        } catch (verifyError) {
          alert('Error verifying payment. Please contact support with your payment ID: ' + response.razorpay_payment_id);
        }
      },
      prefill: {
        name: customerName,
        email: customerEmail
      },
      theme: {
        color: '#2fa101' // Use your brand color
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
    // Add click event listener
    payButton.addEventListener('click', async (e) => {
      e.preventDefault();
      
      // Get payment amount from data attribute or use default
      const amount = payButton.dataset.amount;
      
      // Get customer details (can be customized to get from form fields)
      const customerName = payButton.dataset.name || "Horizion Player";
      const customerEmail = payButton.dataset.email || "";
      
      // Start payment process
      await initiatePayment(amount, customerName, customerEmail);
    });
  }
});

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initiatePayment };
}