import io from 'socket.io-client'

// const URL = 'http://localhost:8000/' 
const URL = 'https://chessbackend-production.up.railway.app' 

const socket = io(URL)

var mySocketId
 

socket.on("createNewGame", statusUpdate => {
    console.log("A new game has been created! Username: " + statusUpdate.userName + ", Game id: " + statusUpdate.gameId + " Socket id: " + statusUpdate.mySocketId)
    mySocketId = statusUpdate.mySocketId
})

export {
    socket,
    mySocketId
}

// import io from 'socket.io-client'

// // Ensure this has the full protocol prefix
// const URL = 'chessbackend-production.up.railway.app' 

// const socket = io(URL)

// var mySocketId
 

// socket.on("createNewGame", statusUpdate => {
//     console.log("A new game has been created! Username: " + statusUpdate.userName + ", Game id: " + statusUpdate.gameId + " Socket id: " + statusUpdate.mySocketId)
//     mySocketId = statusUpdate.mySocketId
// })

// export {
//     socket,
//     mySocketId
// }
