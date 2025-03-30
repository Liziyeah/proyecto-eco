const socket = io("http://localhost:5050", { path: "/rea-time" });

document.getElementById("get-btn").addEventListener("click", getUsers);

function getUsers() {
  fetch("http://localhost:5050/users")
    .then((response) => response.json())
    .then((data) => console.log("get response", data))
    .catch((error) => console.error("Error:", error));
}

const sendCoordenates = () => {
  socket.emit("coordenadas", { x: 123, y: 432 });
};

document.getElementById("event-btn").addEventListener("click", sendCoordenates);

//get: leer info, post: crear info, put: actualizar completo, patch: actualizar parcialmente

// headers: hay que especificar el tipo de elementos que se enviaran, sirve para informarle al servidor que tipos
// de datos se le estan mandando en el cuerpo de la solicitud

//body: 