import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const DownloadImages = () => {
  const [isDownloading, setDownloading] = useState(false);

  const handleDownloadImages = () => {
    setDownloading(true);

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: getAllImageUrls,
          },
          (results) => {
            if (results && results[0]?.result?.length) {
              const imageUrls = results[0].result;

              const validImageUrls = imageUrls.filter(isValidImageFormat);

              if (validImageUrls.length) {
                downloadImagesAsZip(validImageUrls);
              } else {
                console.warn("No valid images found.");
                setDownloading(false);
              }
            } else {
              console.warn("No images found or an error occurred.");
              setDownloading(false);
            }
          }
        );
      }
    });
  };

  const isValidImageFormat = (url: string) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
    const extension = url.split(".").pop()?.toLowerCase();
    return extension && imageExtensions.includes(extension);
  };

  const downloadImagesAsZip = async (imageUrls: string[]) => {
    const zip = new JSZip();
    const imgFolder = zip.folder("images");

    const downloadPromises = imageUrls.map(async (url, index) => {
      const response = await fetch(url);
      const blob = await response.blob();
      const extension = url.split(".").pop()?.toLowerCase();
      imgFolder?.file(`image${index}.${extension}`, blob);
    });

    await Promise.all(downloadPromises);
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "images.zip");
      setDownloading(false);
    });
  };

  return (
    <div>
      <h1>Download All Images</h1>
      <button
        className="download-button"
        onClick={handleDownloadImages}
        disabled={isDownloading}
      >
        {isDownloading ? "Downloading..." : "Download"}
      </button>
    </div>
  );
};

const getAllImageUrls = () => {
  const images = document.querySelectorAll("img");
  const imageUrls = Array.from(images)
    .map((img) => img.src)
    .filter(
      (src) => src && (src.startsWith("http") || src.startsWith("https"))
    );
  return imageUrls;
};

export default DownloadImages;
