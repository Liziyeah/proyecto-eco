const socket = io("http://localhost:5050", { path: "/rea-time" });

function sendUsers() {
  const userInput = document.getElementById('client-username').value;
  fetch("http://localhost:5050/users", {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userInput })
  })
  .then(response => response.json())
  .then(data => {
    console.log(data.message);
  });
}

document.getElementById('join-btn').addEventListener('click', sendUsers);

const sendCoordenates = () => {
  socket.emit("coordenadas", { x: 123, y: 432 });
};

// document.getElementById("event-btn").addEventListener("click", sendCoordenates);

//get: leer info, post: crear info, put: actualizar completo, patch: actualizar parcialmente

// headers: hay que especificar el tipo de elementos que se enviaran, sirve para informarle al servidor que tipos
// de datos se le estan mandando en el cuerpo de la solicitud

//body: 