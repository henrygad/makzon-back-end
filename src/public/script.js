const testing = document.getElementById("click_me_btn");

testing.addEventListener("click", async() => { 
    const res = await fetch("https://localhost:3000/api/test/hello");
    const data = await res.json();
    console.log(data);
});