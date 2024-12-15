export function enableDragDrop(containerId, onEndCallback) {
    const thumbnailsContainer = document.getElementById(containerId);

    // Enable drag-and-drop functionality
    new Sortable(thumbnailsContainer, {
        animation: 150,
        onEnd(evt) {
            console.log("Reordered:", evt.from, evt.to); // Handle reordering of files here
            onEndCallback(evt);
        }
    });
}
