/* Reusblae class for DragDropList */

class DragDropList {
  constructor(options) {
    this.dropzones = document.querySelectorAll(options.selector);
    this.draggedItem = null;
    this.onDrop = options.onDrop;
    this.setup();
  }

  setup() {
    // event listeners for drag item - dragstart, dragend
    document.querySelectorAll(".drag-item").forEach((item) => {
      item.addEventListener("dragstart", (e) => {
        this.draggedItem = item;
        e.dataTransfer.effectAllowed = "move";
        setTimeout(() => (item.style.display = "none"), 0);
      });

      item.addEventListener("dragend", (e) => {
        setTimeout(() => {
          this.draggedItem = null;
          item.style.display = "block";
        }, 0);
      });
    });

    // event listeners for dropzones - dragover, dragleave, drop
    this.dropzones.forEach((zone) => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("drag-over");
      });
      zone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        zone.classList.remove("drag-over");
      });
      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        if (this.draggedItem && this.draggedItem.parentNode !== zone) {
          zone.appendChild(this.draggedItem);
          this.onDrop(this.draggedItem, zone);
        }
      });
    });
  }
}

/* 
<div class="drag-container" data-dropzone>
    <div class="drag-item" draggable="true">Apple</div>
    <div class="drag-item" draggable="true">Banana</div>
</div>
<div class="drag-container" data-dropzone>
</div>
*/

/* Appending the above HTML structure to app element */
function createDragContainer(dragItems) {
  const dragContainer = document.createElement("div");
  dragContainer.classList.add("drag-container");
  dragContainer.dataset.dropzone = "";
  if (dragItems) {
    dragItems.forEach((dragItem) => createDragItem(dragContainer, dragItem));
  }
  return dragContainer;
}

function createDragItem(dragContainer, dragItem) {
  const divElement = document.createElement("div");
  divElement.innerHTML = dragItem;
  divElement.classList.add("drag-item");
  divElement.setAttribute("draggable", true);
  dragContainer.appendChild(divElement);
}

const rootElement = document.getElementById("app");
rootElement.appendChild(createDragContainer(["Apple", "Banana"]));
rootElement.appendChild(createDragContainer());

// Using the DragDropList
new DragDropList({
  selector: "[data-dropzone]",
  onDrop: (droppedItem, zone) => {
    console.log(`Dropped item ${droppedItem.textContent}`);
  },
});
