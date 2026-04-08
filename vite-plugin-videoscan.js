import fs from "fs";
import path from "path";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg"];
const OUTPUT_FILE = path.resolve("src", "video-list.generated.js");

function scanVideos() {
  const videosDir = path.resolve(process.cwd(), "public", "videos");
  let videoFiles = [];

  try {
    if (fs.existsSync(videosDir)) {
      const files = fs.readdirSync(videosDir);
      videoFiles = files
        .filter((file) =>
          VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase()),
        )
        .map((file) => ({
          label: `${path.basename(file, path.extname(file))} (${file})`,
          value: `videos/${file}`,
        }));
    }
  } catch (err) {
    console.error("[video-scan] Error:", err);
  }

  if (videoFiles.length === 0) {
    videoFiles = [
      {
        label: "Default (background.mp4)",
        value: "videos/background.mp4",
      },
    ];
  }

  return videoFiles;
}

function writeVideoList() {
  const videoFiles = scanVideos();
  const code = `// 自动生成，请勿手动编辑
export const PRESET_VIDEOS = ${JSON.stringify(videoFiles, null, 2)}
`;
  fs.writeFileSync(OUTPUT_FILE, code, "utf-8");
  console.log("[video-scan] Generated:", OUTPUT_FILE);
}

export default function videoScanPlugin() {
  return {
    name: "video-scan-plugin",

    configResolved() {
      writeVideoList();
    },

    configureServer(server) {
      const videosDir = path.resolve(process.cwd(), "public", "videos");

      if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true });
      }

      const watcher = fs.watch(videosDir, { encoding: "utf8" }, () => {
        writeVideoList();
        server.ws.send({
          type: "full-reload",
          path: "*",
        });
      });

      server.httpServer?.on("close", () => {
        watcher.close();
      });
    },

    buildStart() {
      writeVideoList();
    },
  };
}
