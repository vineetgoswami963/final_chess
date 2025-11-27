// import React from 'react'
// import Game from '../model/chess'
// import Square from '../model/square'
// import { Stage, Layer } from 'react-konva';
// import Board from '../assets/chessBoard.png'
// import useSound from 'use-sound'
// import chessMove from '../assets/moveSoundEffect.mp3'
// import Piece from './piece'
// import piecemap from './piecemap'
// import { useParams } from 'react-router-dom'
// import { ColorContext } from '../../context/colorcontext' 
// import VideoChatApp from '../../connection/videochat'
// const socket  = require('../../connection/socket').socket


// class ChessGame extends React.Component {

//     state = {
//         gameState: new Game(this.props.color),
//         draggedPieceTargetId: "", // empty string means no piece is being dragged
//         playerTurnToMoveIsWhite: true,
//         whiteKingInCheck: false, 
//         blackKingInCheck: false
//     }


//     componentDidMount() {
//         console.log(this.props.myUserName)
//         console.log(this.props.opponentUserName)
//         // register event listeners
//         socket.on('opponent move', move => {
//             // move == [pieceId, finalPosition]
//             // console.log("opponenet's move: " + move.selectedId + ", " + move.finalPosition)
//             if (move.playerColorThatJustMovedIsWhite !== this.props.color) {
//                 this.movePiece(move.selectedId, move.finalPosition, this.state.gameState, false)
//                 this.setState({
//                     playerTurnToMoveIsWhite: !move.playerColorThatJustMovedIsWhite
//                 })
//             }
//         })
//     }

//     startDragging = (e) => {
//         this.setState({
//             draggedPieceTargetId: e.target.attrs.id
//         })
//     }


//     movePiece = (selectedId, finalPosition, currentGame, isMyMove) => {
//         /**
//          * "update" is the connection between the model and the UI. 
//          * This could also be an HTTP request and the "update" could be the server response.
//          * (model is hosted on the server instead of the browser)
//          */
//         var whiteKingInCheck = false 
//         var blackKingInCheck = false
//         var blackCheckmated = false 
//         var whiteCheckmated = false
//         const update = currentGame.movePiece(selectedId, finalPosition, isMyMove)
        
//         if (update === "moved in the same position.") {
//             this.revertToPreviousState(selectedId) // pass in selected ID to identify the piece that messed up
//             return
//         } else if (update === "user tried to capture their own piece") {
//             this.revertToPreviousState(selectedId) 
//             return
//         } else if (update === "b is in check" || update === "w is in check") { 
//             // change the fill of the enemy king or your king based on which side is in check. 
//             // play a sound or something
//             if (update[0] === "b") {
//                 blackKingInCheck = true
//             } else {
//                 whiteKingInCheck = true
//             }
//         } else if (update === "b has been checkmated" || update === "w has been checkmated") { 
//             if (update[0] === "b") {
//                 blackCheckmated = true
//             } else {
//                 whiteCheckmated = true
//             }
//         } else if (update === "invalid move") {
//             this.revertToPreviousState(selectedId) 
//             return
//         } 

//         // let the server and the other client know your move
//         if (isMyMove) {
//             socket.emit('new move', {
//                 nextPlayerColorToMove: !this.state.gameState.thisPlayersColorIsWhite,
//                 playerColorThatJustMovedIsWhite: this.state.gameState.thisPlayersColorIsWhite,
//                 selectedId: selectedId, 
//                 finalPosition: finalPosition,
//                 gameId: this.props.gameId
//             })
//         }
        

//         this.props.playAudio()   
        
//         // sets the new game state. 
//         this.setState({
//             draggedPieceTargetId: "",
//             gameState: currentGame,
//             playerTurnToMoveIsWhite: !this.props.color,
//             whiteKingInCheck: whiteKingInCheck,
//             blackKingInCheck: blackKingInCheck
//         })

//         if (blackCheckmated) {
//             alert("WHITE WON BY CHECKMATE!")
//         } else if (whiteCheckmated) {
//             alert("BLACK WON BY CHECKMATE!")
//         }
//     }


//     endDragging = (e) => {
//         const currentGame = this.state.gameState
//         const currentBoard = currentGame.getBoard()
//         const finalPosition = this.inferCoord(e.target.x() + 90, e.target.y() + 90, currentBoard)
//         const selectedId = this.state.draggedPieceTargetId
//         this.movePiece(selectedId, finalPosition, currentGame, true)
//     }

//     revertToPreviousState = (selectedId) => {
//         /**
//          * Should update the UI to what the board looked like before. 
//          */
//         const oldGS = this.state.gameState
//         const oldBoard = oldGS.getBoard()
//         const tmpGS = new Game(true)
//         const tmpBoard = []

//         for (var i = 0; i < 8; i++) {
//             tmpBoard.push([])
//             for (var j = 0; j < 8; j++) {
//                 if (oldBoard[i][j].getPieceIdOnThisSquare() === selectedId) {
//                     tmpBoard[i].push(new Square(j, i, null, oldBoard[i][j].canvasCoord))
//                 } else {
//                     tmpBoard[i].push(oldBoard[i][j])
//                 }
//             }
//         }

//         // temporarily remove the piece that was just moved
//         tmpGS.setBoard(tmpBoard)

//         this.setState({
//             gameState: tmpGS,
//             draggedPieceTargetId: "",
//         })

//         this.setState({
//             gameState: oldGS,
//         })
//     }

 
//     inferCoord = (x, y, chessBoard) => {
//         // console.log("actual mouse coordinates: " + x + ", " + y)
//         /*
//             Should give the closest estimate for new position. 
//         */
//         var hashmap = {}
//         var shortestDistance = Infinity
//         for (var i = 0; i < 8; i++) {
//             for (var j = 0; j < 8; j++) {
//                 const canvasCoord = chessBoard[i][j].getCanvasCoord()
//                 // calculate distance
//                 const delta_x = canvasCoord[0] - x 
//                 const delta_y = canvasCoord[1] - y
//                 const newDistance = Math.sqrt(delta_x**2 + delta_y**2)
//                 hashmap[newDistance] = canvasCoord
//                 if (newDistance < shortestDistance) {
//                     shortestDistance = newDistance
//                 }
//             }
//         }

//         return hashmap[shortestDistance]
//     }
   
//     render() {
//         // console.log(this.state.gameState.getBoard())
//        //  console.log("it's white's move this time: " + this.state.playerTurnToMoveIsWhite)
//         /*
//             Look at the current game state in the model and populate the UI accordingly
//         */
//         // console.log(this.state.gameState.getBoard())
        
//         return (
//         <React.Fragment>
//         <div style = {{
//             backgroundImage: `url(${Board})`,
//             width: "720px",
//             height: "720px"}}
//         >
//             <Stage width = {720} height = {720}>
//                 <Layer>
//                 {this.state.gameState.getBoard().map((row) => {
//                         return (<React.Fragment>
//                                 {row.map((square) => {
//                                     if (square.isOccupied()) {                                    
//                                         return (
//                                             <Piece 
//                                                 x = {square.getCanvasCoord()[0]}
//                                                 y = {square.getCanvasCoord()[1]} 
//                                                 imgurls = {piecemap[square.getPiece().name]}
//                                                 isWhite = {square.getPiece().color === "white"}
//                                                 draggedPieceTargetId = {this.state.draggedPieceTargetId}
//                                                 onDragStart = {this.startDragging}
//                                                 onDragEnd = {this.endDragging}
//                                                 id = {square.getPieceIdOnThisSquare()}
//                                                 thisPlayersColorIsWhite = {this.props.color}
//                                                 playerTurnToMoveIsWhite = {this.state.playerTurnToMoveIsWhite}
//                                                 whiteKingInCheck = {this.state.whiteKingInCheck}
//                                                 blackKingInCheck = {this.state.blackKingInCheck}
//                                                 />)
//                                     }
//                                     return
//                                 })}
//                             </React.Fragment>)
//                     })}
//                 </Layer>
//             </Stage>
//         </div>
//         </React.Fragment>)
//     }
// }



// const ChessGameWrapper = (props) => {
//     /**
//      * player 1
//      *      - socketId 1
//      *      - socketId 2 ???
//      * player 2
//      *      - socketId 2
//      *      - socketId 1
//      */



//     // get the gameId from the URL here and pass it to the chessGame component as a prop. 
//     const domainName = 'https://final-chess-git-main-vineetgoswami963s-projects.vercel.app'
//      const color = React.useContext(ColorContext)
//     const { gameid } = useParams()
//     const [play] = useSound(chessMove);
//     const [opponentSocketId, setOpponentSocketId] = React.useState('')
//     const [opponentDidJoinTheGame, didJoinGame] = React.useState(false)
//     const [opponentUserName, setUserName] = React.useState('')
//     const [gameSessionDoesNotExist, doesntExist] = React.useState(false)

//     React.useEffect(() => {
//         socket.on("playerJoinedRoom", statusUpdate => {
//             console.log("A new player has joined the room! Username: " + statusUpdate.userName + ", Game id: " + statusUpdate.gameId + " Socket id: " + statusUpdate.mySocketId)
//             if (socket.id !== statusUpdate.mySocketId) {
//                 setOpponentSocketId(statusUpdate.mySocketId)
//             }
//         })
    
//         socket.on("status", statusUpdate => {
//             console.log(statusUpdate)
//             alert(statusUpdate)
//             if (statusUpdate === 'This game session does not exist.' || statusUpdate === 'There are already 2 people playing in this room.') {
//                 doesntExist(true)
//             }
//         })
        
    
//         socket.on('start game', (opponentUserName) => {
//             console.log("START!")
//             if (opponentUserName !== props.myUserName) {
//                 setUserName(opponentUserName)
//                 didJoinGame(true) 
//             } else {
//                 // in chessGame, pass opponentUserName as a prop and label it as the enemy. 
//                 // in chessGame, use reactContext to get your own userName
//                 // socket.emit('myUserName')
//                 socket.emit('request username', gameid)
//             }
//         })
    
    
//         socket.on('give userName', (socketId) => {
//             if (socket.id !== socketId) {
//                 console.log("give userName stage: " + props.myUserName)
//                 socket.emit('recieved userName', {userName: props.myUserName, gameId: gameid})
//             }
//         })
    
//         socket.on('get Opponent UserName', (data) => {
//             if (socket.id !== data.socketId) {
//                 setUserName(data.userName)
//                 console.log('data.socketId: data.socketId')
//                 setOpponentSocketId(data.socketId)
//                 didJoinGame(true) 
//             }
//         })
//     }, [])


//     return (
//       <React.Fragment>
//         {opponentDidJoinTheGame ? (
//           <div>
//             <h4> Opponent: {opponentUserName} </h4>
//             <div style={{ display: "flex" }}>
//               <ChessGame
//                 playAudio={play}
//                 gameId={gameid}
//                 color={color.didRedirect}
//               />
//               <VideoChatApp
//                 mySocketId={socket.id}
//                 opponentSocketId={opponentSocketId}
//                 myUserName={props.myUserName}
//                 opponentUserName={opponentUserName}
//               />
//             </div>
//             <h4> You: {props.myUserName} </h4>
//           </div>
//         ) : gameSessionDoesNotExist ? (
//           <div>
//             <h1 style={{ textAlign: "center", marginTop: "200px" }}> :( </h1>
//           </div>
//         ) : (
//           <div>
//             <h1
//               style={{
//                 textAlign: "center",
//                 marginTop: String(window.innerHeight / 8) + "px",
//               }}
//             >
//               Hey <strong>{props.myUserName}</strong>, copy and paste the URL
//               below to send to your friend:
//             </h1>
//             <textarea
//               style={{ marginLeft: String((window.innerWidth / 2) - 290) + "px", marginTop: "30" + "px", width: "580px", height: "30px"}}
//               onFocus={(event) => {
//                   console.log('sd')
//                   event.target.select()
//               }}
//               value = {domainName + "/game/" + gameid}
//               type = "text">
//               </textarea>
//             <br></br>

//             <h1 style={{ textAlign: "center", marginTop: "100px" }}>
//               {" "}
//               Waiting for other opponent to join the game...{" "}
//             </h1>
//           </div>
//         )}
//       </React.Fragment>
//     );
// };

// export default ChessGameWrapper

import React from 'react'
import Game from '../model/chess'
import Square from '../model/square'
import { Stage, Layer } from 'react-konva';
import Board from '../assets/chessBoard.png'
import useSound from 'use-sound'
import chessMove from '../assets/moveSoundEffect.mp3'
import Piece from './piece'
import piecemap from './piecemap'
import { useParams } from 'react-router-dom'
import { ColorContext } from '../../context/colorcontext' 
import VideoChatApp from '../../connection/videochat'
import styled from 'styled-components';

const socket  = require('../../connection/socket').socket

// --- Styled Components ---

const MainContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
  background-color: #2c3e50;
  overflow: hidden; // Prevent scrolling
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const BoardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  /* Make board square and responsive to height */
  height: 90vh;
  width: 90vh; 
  max-width: 100%;
  max-height: 100%;
  background-image: url(${props => props.bg});
  background-size: cover;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  position: relative;
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 90vh;
  width: 350px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 20px;
  color: white;

  @media (max-width: 900px) {
    width: 90vw;
    height: auto;
    flex-direction: row;
    align-items: center;
  }
`;

const PlayerInfo = styled.div`
  background: rgba(0,0,0,0.3);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  
  h3 { margin: 0; font-size: 1.2rem; color: #ecf0f1; }
  span { font-size: 0.9rem; color: #bdc3c7; }
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 8px;
  animation: fadeIn 0.3s ease-in-out;
`;

const ModalContent = styled.div`
  text-align: center;
  color: white;
  h1 { font-size: 3rem; margin-bottom: 20px; color: #f1c40f; text-shadow: 0 2px 10px black;}
  p { font-size: 1.5rem; margin-bottom: 30px; }
`;

const ActionButton = styled.button`
  padding: 15px 40px;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(118, 75, 162, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(118, 75, 162, 0.6);
  }
  &:active {
    transform: translateY(1px);
  }
`;

class ChessGame extends React.Component {
    state = {
        gameState: new Game(this.props.color),
        draggedPieceTargetId: "",
        playerTurnToMoveIsWhite: true,
        whiteKingInCheck: false, 
        blackKingInCheck: false,
        gameOver: false,
        winner: null, // "white" or "black"
        rematchRequested: false,
        boardSize: 600 // Initial default
    }

    componentDidMount() {
        this.updateBoardSize();
        window.addEventListener('resize', this.updateBoardSize);

        socket.on('opponent move', move => {
            if (move.playerColorThatJustMovedIsWhite !== this.props.color) {
                this.movePiece(move.selectedId, move.finalPosition, this.state.gameState, false)
                this.setState({
                    playerTurnToMoveIsWhite: !move.playerColorThatJustMovedIsWhite
                })
            }
        })

        // --- Rematch Listeners ---
        socket.on('rematchRequested', () => {
            // Show some UI that opponent wants to play again
            if(window.confirm("Opponent wants a rematch. Do you accept?")) {
                socket.emit('acceptRematch', this.props.gameId);
            }
        });

        socket.on('gameRestarted', () => {
            this.resetGame();
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateBoardSize);
    }

    updateBoardSize = () => {
        // Calculate size based on window height to fit in screen without scrolling
        // We leave some buffer (approx 100px) for padding/margins
        const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
        this.setState({ boardSize: size });
    }

    resetGame = () => {
        this.setState({
            gameState: new Game(this.props.color),
            draggedPieceTargetId: "",
            playerTurnToMoveIsWhite: true,
            whiteKingInCheck: false,
            blackKingInCheck: false,
            gameOver: false,
            winner: null,
            rematchRequested: false
        })
    }

    handleRematch = () => {
        socket.emit('requestRematch', this.props.gameId);
        this.setState({ rematchRequested: true });
    }

    startDragging = (e) => {
        this.setState({ draggedPieceTargetId: e.target.attrs.id })
    }

    movePiece = (selectedId, finalPosition, currentGame, isMyMove) => {
        var whiteKingInCheck = false 
        var blackKingInCheck = false
        var blackCheckmated = false 
        var whiteCheckmated = false
        const update = currentGame.movePiece(selectedId, finalPosition, isMyMove)
        
        if (update === "moved in the same position." || update === "user tried to capture their own piece" || update === "invalid move") {
            this.revertToPreviousState(selectedId) 
            return
        } else if (update === "b is in check" || update === "w is in check") { 
            if (update[0] === "b") blackKingInCheck = true
            else whiteKingInCheck = true
        } else if (update === "b has been checkmated" || update === "w has been checkmated") { 
            if (update[0] === "b") blackCheckmated = true
            else whiteCheckmated = true
        } 

        if (isMyMove) {
            socket.emit('new move', {
                nextPlayerColorToMove: !this.state.gameState.thisPlayersColorIsWhite,
                playerColorThatJustMovedIsWhite: this.state.gameState.thisPlayersColorIsWhite,
                selectedId: selectedId, 
                finalPosition: finalPosition,
                gameId: this.props.gameId
            })
        }
        
        this.props.playAudio()   
        
        this.setState({
            draggedPieceTargetId: "",
            gameState: currentGame,
            playerTurnToMoveIsWhite: !this.props.color,
            whiteKingInCheck: whiteKingInCheck,
            blackKingInCheck: blackKingInCheck
        })

        if (blackCheckmated) {
            this.setState({ gameOver: true, winner: 'white' })
        } else if (whiteCheckmated) {
            this.setState({ gameOver: true, winner: 'black' })
        }
    }

    endDragging = (e) => {
        const currentGame = this.state.gameState
        const currentBoard = currentGame.getBoard()
        const finalPosition = this.inferCoord(e.target.x() + 90, e.target.y() + 90, currentBoard)
        const selectedId = this.state.draggedPieceTargetId
        this.movePiece(selectedId, finalPosition, currentGame, true)
    }

    revertToPreviousState = (selectedId) => {
        const oldGS = this.state.gameState
        const oldBoard = oldGS.getBoard()
        const tmpGS = new Game(true)
        const tmpBoard = []
        for (var i = 0; i < 8; i++) {
            tmpBoard.push([])
            for (var j = 0; j < 8; j++) {
                if (oldBoard[i][j].getPieceIdOnThisSquare() === selectedId) {
                    tmpBoard[i].push(new Square(j, i, null, oldBoard[i][j].canvasCoord))
                } else {
                    tmpBoard[i].push(oldBoard[i][j])
                }
            }
        }
        tmpGS.setBoard(tmpBoard)
        this.setState({ gameState: tmpGS, draggedPieceTargetId: "" })
        this.setState({ gameState: oldGS })
    }

    inferCoord = (x, y, chessBoard) => {
        var hashmap = {}
        var shortestDistance = Infinity
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                const canvasCoord = chessBoard[i][j].getCanvasCoord()
                const delta_x = canvasCoord[0] - x 
                const delta_y = canvasCoord[1] - y
                const newDistance = Math.sqrt(delta_x**2 + delta_y**2)
                hashmap[newDistance] = canvasCoord
                if (newDistance < shortestDistance) shortestDistance = newDistance
            }
        }
        return hashmap[shortestDistance]
    }
   
    render() {
        const { boardSize, gameOver, winner, rematchRequested } = this.state;
        const scaleRatio = boardSize / 720; // 720 is the original image size

        return (
        <React.Fragment>
            <BoardContainer bg={Board} style={{ width: boardSize, height: boardSize }}>
                <Stage width={boardSize} height={boardSize} scaleX={scaleRatio} scaleY={scaleRatio}>
                    <Layer>
                    {this.state.gameState.getBoard().map((row) => {
                            return (<React.Fragment>
                                    {row.map((square) => {
                                        if (square.isOccupied()) {                                    
                                            return (
                                                <Piece 
                                                    x = {square.getCanvasCoord()[0]}
                                                    y = {square.getCanvasCoord()[1]} 
                                                    imgurls = {piecemap[square.getPiece().name]}
                                                    isWhite = {square.getPiece().color === "white"}
                                                    draggedPieceTargetId = {this.state.draggedPieceTargetId}
                                                    onDragStart = {this.startDragging}
                                                    onDragEnd = {this.endDragging}
                                                    id = {square.getPieceIdOnThisSquare()}
                                                    thisPlayersColorIsWhite = {this.props.color}
                                                    playerTurnToMoveIsWhite = {this.state.playerTurnToMoveIsWhite}
                                                    whiteKingInCheck = {this.state.whiteKingInCheck}
                                                    blackKingInCheck = {this.state.blackKingInCheck}
                                                    />)
                                        }
                                        return
                                    })}
                                </React.Fragment>)
                        })}
                    </Layer>
                </Stage>

                {/* GAME OVER MODAL */}
                {gameOver && (
                    <ModalOverlay>
                        <ModalContent>
                            <h1>{winner === 'white' ? "White Wins!" : "Black Wins!"}</h1>
                            <p>Checkmate.</p>
                            {rematchRequested ? (
                                <p>Waiting for opponent...</p>
                            ) : (
                                <ActionButton onClick={this.handleRematch}>Play Again</ActionButton>
                            )}
                        </ModalContent>
                    </ModalOverlay>
                )}
            </BoardContainer>
        </React.Fragment>)
    }
}


const ChessGameWrapper = (props) => {
    const domainName = 'https://final-chess-git-main-vineetgoswami963s-projects.vercel.app'
    // const domainName = 'http://localhost:3000'


    const color = React.useContext(ColorContext)
    const { gameid } = useParams()
    const [play] = useSound(chessMove);
    const [opponentSocketId, setOpponentSocketId] = React.useState('')
    const [opponentDidJoinTheGame, didJoinGame] = React.useState(false)
    const [opponentUserName, setUserName] = React.useState('')
    
    // ... [Keep existing socket useEffects from your code here] ...
    // Note: I'm omitting the exact socket code for brevity, but copy it from your original file.
    // Ensure you keep the socket listeners for 'playerJoinedRoom', 'status', 'start game' etc.
    
    // For the purpose of this layout fix, I will assume the socket logic is present.
    // Insert existing useEffect here.

    React.useEffect(() => {
        socket.on("playerJoinedRoom", statusUpdate => {
            if (socket.id !== statusUpdate.mySocketId) setOpponentSocketId(statusUpdate.mySocketId)
        })
        socket.on("status", statusUpdate => {
            alert(statusUpdate)
        })
        socket.on('start game', (opponentUserName) => {
            if (opponentUserName !== props.myUserName) {
                setUserName(opponentUserName)
                didJoinGame(true) 
            } else {
                socket.emit('request username', gameid)
            }
        })
        socket.on('give userName', (socketId) => {
            if (socket.id !== socketId) socket.emit('recieved userName', {userName: props.myUserName, gameId: gameid})
        })
        socket.on('get Opponent UserName', (data) => {
            if (socket.id !== data.socketId) {
                setUserName(data.userName)
                setOpponentSocketId(data.socketId)
                didJoinGame(true) 
            }
        })
    }, [])


    return (
      <React.Fragment>
        {opponentDidJoinTheGame ? (
          <MainContainer>
            {/* Left Side: Board */}
            <ChessGame
                playAudio={play}
                gameId={gameid}
                color={color.didRedirect}
            />

            {/* Right Side: Info & Video */}
            <SidePanel>
                <div>
                    <PlayerInfo>
                        <h3>Opponent</h3>
                        <span>{opponentUserName}</span>
                    </PlayerInfo>
                    <PlayerInfo>
                        <h3>You</h3>
                        <span>{props.myUserName}</span>
                    </PlayerInfo>
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                     <VideoChatApp
                        mySocketId={socket.id}
                        opponentSocketId={opponentSocketId}
                        myUserName={props.myUserName}
                        opponentUserName={opponentUserName}
                    />
                </div>
            </SidePanel>
          </MainContainer>
        ) : (
           // Keep your existing "Waiting for opponent" screen or style it similarly
           <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'#f0f2f5' }}>
               <h1>Copy and share this URL:</h1>
               <input 
                 style={{ width: '400px', padding: '15px', fontSize: '1.2rem', margin: '20px' }}
                 value={`${domainName}/game/${gameid}`} 
                 readOnly 
                 onFocus={e => e.target.select()}
               />
               <h3>Waiting for opponent...</h3>
           </div>
        )}
      </React.Fragment>
    );
};

export default ChessGameWrapper