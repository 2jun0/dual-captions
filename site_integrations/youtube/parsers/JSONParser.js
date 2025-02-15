const YouTubeJSONParser = (captionFile) => {
  return new Promise((resolve, reject) => {
    const captions = [];
    try {
      const parsedCaptionFile = JSON.parse(captionFile);
      if (parsedCaptionFile.events) {
        parsedCaptionFile.events.forEach(ev => {
          if (ev.segs && ev.tStartMs && ev.dDurationMs) {
            // Seems like YouTube made the switch from their old schema
            // to have non UTF-8 captions.
            // This will need expansion once they add more seg types.
            let text = '';
            const utf8Seg = ev.segs.find(seg => seg && seg.utf8);
            if (utf8Seg) {
              text = utf8Seg.utf8;
            } else {
              console.error(`YouTubeJSONParser - No UTF-8 seg, event: ${JSON.stringify(ev)}`);
            }
            const startTime = ev.tStartMs / 1000;
            const endTime = startTime + (ev.dDurationMs / 1000);
            if (text && Number(startTime) && Number(endTime)) {
              captions.push({
                text,
                startTime,
                endTime
              });
            }
          } else {
            console.error(`YouTubeJSONParser - Event had no segs, start or duration, event: ${JSON.stringify(ev)}`);
          }
        });
      } else {
        console.error('YouTubeJSONParser - Expected "events".');
        reject();
      }
    } catch (err) {
      console.error('YouTubeJSONParser - Invalid JSON file');
      reject();
    }
    resolve(captions);
  });
}

module.exports = YouTubeJSONParser;
