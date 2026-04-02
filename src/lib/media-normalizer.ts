export function normalizeMediaUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.toLowerCase();

    // YouTube handling
    if (domain.includes("youtube.com") || domain.includes("youtu.be")) {
      const videoId = domain.includes("youtu.be") 
        ? parsedUrl.pathname.slice(1) 
        : parsedUrl.searchParams.get("v");
      
      if (videoId) {
        return {
          source_type: "youtube",
          original_url: url,
          thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          validation_status: "valid"
        };
      }
    }

    // Default image fallback
    const ext = parsedUrl.pathname.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');

    if (isImage || domain.includes("githubusercontent.com")) {
      return {
        source_type: "image_url",
        original_url: url,
        thumbnail_url: url,
        validation_status: "valid"
      };
    }

    return {
      source_type: "unknown",
      original_url: url,
      thumbnail_url: null,
      validation_status: "pending"
    };

  } catch (e) {
    return {
      source_type: "invalid",
      original_url: url,
      thumbnail_url: null,
      validation_status: "invalid"
    };
  }
}
