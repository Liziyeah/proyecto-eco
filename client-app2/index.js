const socket = io("http://localhost:5050", { path: "/rea-time" });

document.getElementById("get-btn").addEventListener("click", getUsers);

function getUsers() {
  fetch("http://localhost:5050/users")
    .then((response) => response.json())
    .then((data) => console.log("get response", data))
    .catch((error) => console.error("Error:", error));
}

socket.on("coordenadas", (data) => {
  console.log(data);
});