const button = document.getElementById("click_me_btn");
const display_video = document.getElementById("display_video");

button.addEventListener("click", async () => {
  const res = await fetch("https://localhost:3000/api/test/hello");
  const data = await res.json();
  console.log(data);
});

const url =
  "https://localhost:3000/api/file/videos/1735562911109-291751540.webm";

fetch(url, {
  headers: {
    Range: "bytes=0-2097151",
  },
})
  .then((response) => {
    if (response.status === 206) {
      return response.blob();
    }
    throw new Error("Unexpected response status:", response.status);
  })
  .then((blob) => {
    // Create a URL for the blob and set it as the source of a video element
    console.log(blob);
    const videoUrl = URL.createObjectURL(blob);
    const video = document.createElement("video");
    const source = document.createElement("source");
    video.controls = true;
    video.classList.add("video");
    source.src = videoUrl;
    source.type = "video/webm";
    video.appendChild(source);
    display_video.appendChild(video);
  })
  .catch((error) => console.error("Error fetching video:", error));
