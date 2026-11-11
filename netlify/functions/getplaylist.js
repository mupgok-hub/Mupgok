
exports.handler = async function () {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const PLAYLIST_ID = "PLTQO-vsCtZqE";

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "YouTube API key is not configured"
      })
    };
  }

  try {
    let videos = [];
    let nextPageToken = "";

    do {
      const params = new URLSearchParams({
        part: "snippet,contentDetails",
        playlistId: PLAYLIST_ID,
        maxResults: "50",
        key: API_KEY
      });

      if (nextPageToken) {
        params.set("pageToken", nextPageToken);
      }

      const response = await fetch(
        "https://www.googleapis.com/youtube/v3/playlistItems?" +
        params.toString()
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
          "YouTube API request failed"
        );
      }

      for (const item of data.items || []) {
        const videoId = item.contentDetails?.videoId;

        if (videoId) {
          videos.push({
            id: videoId,
            title: item.snippet?.title || "Unknown title",
            thumbnail:
              item.snippet?.thumbnails?.medium?.url ||
              item.snippet?.thumbnails?.default?.url ||
              ""
          });
        }
      }

      nextPageToken = data.nextPageToken || "";

    } while (nextPageToken);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300"
      },
      body: JSON.stringify({
        total: videos.length,
        videos: videos
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
