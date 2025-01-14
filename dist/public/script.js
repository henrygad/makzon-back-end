"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const button = document.getElementById("click_me_btn");
const display_video = document.getElementById("display_video");
const display_sse_data = document.getElementById("display_sse_data");
const pause_sse = document.getElementById("pause_sse");
const resume_sse = document.getElementById("resume_sse");
button.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield fetch("https://localhost:3000/api/test/hello");
    const data = yield res.json();
    console.log(data);
}));
const url = "https://localhost:3000/api/file/videos/1735562911109-291751540.webm";
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
let eventSource;
const startSSE = () => {
    eventSource = new EventSource("https://localhost:3000/api/sse");
    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const { message, count } = data;
        const input = `Message: ${message} 
    <span> Count: ${count || 0}</span>`;
        display_sse_data.innerHTML = input;
    };
    eventSource.error = (error) => {
        console.log("error", error);
        eventSource.close();
    };
};
startSSE();
pause_sse.addEventListener("click", () => {
    if (eventSource) {
        eventSource.close(); // Temporarily stop receiving events
        display_sse_data.innerHTML = "Streaming paused.";
    }
});
resume_sse.addEventListener("click", () => {
    if (eventSource.readyState === EventSource.CLOSED) {
        console.log("play");
        startSSE();
    }
});
