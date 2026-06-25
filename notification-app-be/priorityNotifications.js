const axios = require("axios");

require("dotenv").config();

// Priority Weight
const priority = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

async function getTopNotifications(limit = 10) {
  try {
    const response = await axios.get(process.env.API_URL, {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    });

    const notifications = response.data.notifications;

    if (!notifications) {
      throw new Error(
        `Unexpected API response: ${JSON.stringify(response.data)}`,
      );
    }

    // Sort by Priority first, then Latest Timestamp
    notifications.sort((a, b) => {
      const priorityDiff = priority[b.Type] - priority[a.Type];

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return new Date(b.Timestamp) - new Date(a.Timestamp);
    });

    return notifications.slice(0, limit);
  } catch (error) {
    console.error(
      "Error fetching notifications:",
      error.response?.data || error.message,
    );
    return [];
  }
}

(async () => {
  const topNotifications = await getTopNotifications();

  console.log("\nTop Priority Notifications\n");

  if (topNotifications.length === 0) {
    console.log(
      "No notifications available. Check your ACCESS_TOKEN in .env file.",
    );
    return;
  }

  console.table(
    topNotifications.map((notification) => ({
      ID: notification.ID,
      Type: notification.Type,
      Priority: priority[notification.Type],
      Message: notification.Message,
      Timestamp: notification.Timestamp,
    })),
  );
})();
