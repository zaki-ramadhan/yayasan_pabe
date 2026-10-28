/**
 * Mock WhatsApp Driver for development and testing.
 * Outputs message payloads directly to application logs without external API calls.
 */
export async function sendMockWhatsApp({ to, message, actionUrl = null, routineType = "REMINDER_ONLY" }) {
  const timestamp = new Date().toISOString();
  
  console.log(`\n======================================================`);
  console.log(`[WA MOCK DRIVER] Notification Dispatched (${timestamp})`);
  console.log(`Target Phone : ${to}`);
  console.log(`Type         : ${routineType}`);
  if (actionUrl) {
    console.log(`Action Link  : ${actionUrl}`);
  }
  console.log(`Message Body :`);
  console.log(message);
  console.log(`======================================================\n`);

  return {
    success: true,
    provider: "MOCK",
    messageId: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    status: "DELIVERED",
  };
}
