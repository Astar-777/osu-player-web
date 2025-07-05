import "../css/SongsList.css";
import "../css/QueueTab.css";
import missing from "../assets/osu-player-logo.png";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function QueueTab({ songs, queue, setQueue, onClose }) {
    const handleRemove = (queuePosition) => {
        const updatedQueue = [...queue];
        updatedQueue.splice(queuePosition, 1);
        setQueue(updatedQueue);
    };

    const handleDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination || source.index === destination.index) return;

        const updatedQueue = [...queue];
        const [movedItem] = updatedQueue.splice(source.index, 1);
        updatedQueue.splice(destination.index, 0, movedItem);
        setQueue(updatedQueue);
    };

    return (
        <div className="queue-modal-overlay">
            <div className="queue-modal">
                <div className="queue-header">
                    <h2>Queue</h2>
                    <button
                        className="queue-clear-button"
                        onClick={() => setQueue([])}
                    >
                        🗑
                        <span className="tooltip">Clear Queue</span>
                    </button>
                    <button className="queue-close-button" onClick={onClose}>×</button>
                </div>

                {queue.length > 0 ? (
                    <div className="queue-scroll-container custom-scrollbar">
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="queue">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {queue.map((songIndex, i) => {
                                            const song = songs[songIndex];

                                            return (
                                                <Draggable
                                                    key={`queue-${i}`}
                                                    draggableId={`queue-${i}`}
                                                    index={i}
                                                >
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                        >
                                                            <div className="song-item queue-hover">
                                                                <img
                                                                    src={song.cover || missing}
                                                                    alt={song.title}
                                                                    className="song-cover"
                                                                />
                                                                <div className="song-info">
                                                                    <p className="song-title">{song.title}</p>
                                                                    <p className="song-details">{song.artist}</p>
                                                                </div>

                                                                <button
                                                                    className="song-queue-remove-button"
                                                                    onClick={() => handleRemove(i)}
                                                                >
                                                                    ×
                                                                </button>

                                                                <div
                                                                    className="drag-handle-button"
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    ☰
                                                                </div>
                                                            </div>

                                                            {i < queue.length - 1 && (
                                                                <div
                                                                    style={{
                                                                        height: "10px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            height: '1px',
                                                                            width: '100%',
                                                                            backgroundColor: 'rgba(128, 128, 128, 0.25)',
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                ) : (
                    <p className="no-queued-songs">Empty.</p>
                )}
            </div>
        </div>
    );
}

export default QueueTab;