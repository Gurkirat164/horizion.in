import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envFile =
      process.env.NODE_ENV === "production" ? ".env.production" : ".env";
dotenv.config({ path: join(__dirname, envFile) });

// Create Discord client with necessary intents
const client = new Client({
      intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
      ],
});

// Bot ready event
client.once("ready", () => {
      console.log(`Discord bot logged in as ${client.user.tag}!`);
      console.log(`Bot is in ${client.guilds.cache.size} guilds`);
});

// Function to send payment success notification
export async function sendPaymentNotification(paymentData) {
      try {
            const channelId = process.env.DISCORD_CHANNEL_ID;
            const channel = await client.channels.fetch(channelId);

            if (!channel) {
                  console.error("Discord channel not found!");
                  return;
            }

            // Create an embed for the payment notification
            const embed = new EmbedBuilder()
                  .setTitle("💰 Payment Successful!")
                  .setColor(0x00ff00) // Green color
                  .addFields(
                        {
                              name: "🛍️ Service",
                              value:
                                    paymentData.serviceName ||
                                    "Unknown Service",
                              inline: true,
                        },
                        {
                              name: "💵 Amount",
                              value: `₹${(paymentData.amount / 100).toFixed(
                                    2
                              )}`,
                              inline: true,
                        },
                        {
                              name: "🆔 Order ID",
                              value: paymentData.orderId,
                              inline: true,
                        },
                        {
                              name: "🔑 Payment ID",
                              value: paymentData.paymentId,
                              inline: false,
                        }
                  )
                  .setTimestamp()
                  .setFooter({
                        text: "Horizion Network - Payment System",
                        iconURL: "https://cdn.discordapp.com/attachments/your-icon-here", // Replace with your server icon
                  });

            // Add customer info if available
            if (paymentData.customerEmail) {
                  embed.addFields({
                        name: "📧 Customer",
                        value: paymentData.customerEmail,
                        inline: true,
                  });
            }

            await channel.send({ embeds: [embed] });
            console.log("Payment notification sent to Discord successfully!");
      } catch (error) {
            console.error("Error sending Discord notification:", error);
      }
}

// Function to send custom message to Discord channel
export async function sendCustomMessage(message, isError = false) {
      try {
            const channelId = process.env.DISCORD_CHANNEL_ID;
            const channel = await client.channels.fetch(channelId);

            if (!channel) {
                  console.error("Discord channel not found!");
                  return;
            }

            const embed = new EmbedBuilder()
                  .setTitle(isError ? "❌ Error" : "📢 Notification")
                  .setDescription(message)
                  .setColor(isError ? 0xff0000 : 0x0099ff) // Red for errors, blue for info
                  .setTimestamp();

            await channel.send({ embeds: [embed] });
            console.log("Custom message sent to Discord successfully!");
      } catch (error) {
            console.error("Error sending custom Discord message:", error);
      }
}

// Error handling
client.on("error", (error) => {
      console.error("Discord bot error:", error);
});

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN)
      .then(() => {
            console.log("Discord bot login successful!");
      })
      .catch((error) => {
            console.error("Failed to login to Discord:", error);
      });

// Export the client for external use
export { client };
