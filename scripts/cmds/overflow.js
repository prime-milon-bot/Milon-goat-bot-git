const axios = require("axios");

module.exports = {
  config: {
    name: "overflow",
    version: "3.4",
    author: "Eren",
    countDown: 5,
    role: 2,
    shortDescription: "Watch overflow",
    longDescription: "List all episodes and play selected one",
    category: "18+",
    guide: "{pn} => Show all episodes"
  },

  onStart: async function ({ api, event }) {
    try {
      const res = await axios.get("https://high-school-dxd.onrender.com/dxd");
      const episodes = res.data;

      if (!episodes || Object.keys(episodes).length === 0)
        return api.sendMessage("❌ No episodes found.", event.threadID);

      let msg = `🎬 overflow Hentai Episodes:\n\n`;
      const mapEp = [];

      Object.keys(episodes).forEach((epKey, i) => {
        const epData = episodes[epKey];
        msg += `${i + 1}: ${epData.title}\n`;
        mapEp.push(epData);
      });

      msg += `\n📝 Reply with episode number to watch`;

      // Send episode list as a reply to the user's command message
      return api.sendMessage(msg, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          data: mapEp
        });
      }, event.messageID);  // <-- reply to user's command message here

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Failed to load episode list.", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const chosen = parseInt(event.body);
    const epList = Reply.data;

    if (isNaN(chosen) || chosen < 1 || chosen > epList.length)
      return api.sendMessage("❌ Invalid episode number.", event.threadID, event.messageID);

    const selectedEp = epList[chosen - 1];

    // Delete the episode list message for a clean chat
    try {
      await api.unsendMessage(Reply.messageID);
    } catch (e) {
      console.log("Failed to delete episode list message:", e);
    }

    // Send video as a reply to the user's reply message
    return api.sendMessage({
      body: `🎥 ${selectedEp.title}`,
      attachment: await global.utils.getStreamFromURL(selectedEp.video)
    }, event.threadID, event.messageID);  // <-- reply to user's number message here
  }
};
