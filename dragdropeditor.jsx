const DragDropEditor = () => {
  const [currentLayout, setCurrentLayout] = useState([]);

  const initEditor = useCallback(() => {
    const savedLayout = JSON.parse(localStorage.getItem('editorLayout') || '[]');
    setCurrentLayout(savedLayout);
  }, []);

  const handleDragStart = useCallback((e, element) => {
    e.dataTransfer.setData('text/plain', element.id);
    e.target.classList.add('dragging');
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    const target = e.currentTarget;
    target.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.target.classList.remove('dragging','drag-over');
  }, []);

  const handleDrop = useCallback((e, targetPosition) => {
    e.preventDefault();
    const target = e.currentTarget;
    target.classList.remove('drag-over');

    const elementId = e.dataTransfer.getData('text/plain');
    const draggedElement = currentLayout.find(el => el.id === elementId);
    if (!draggedElement) return;

    const draggedElementIndex = currentLayout.findIndex(el => el.id === elementId);
    const newLayout = currentLayout.filter(el => el.id !== elementId);
    const adjustedPosition = draggedElementIndex < targetPosition ? targetPosition - 1 : targetPosition;

    newLayout.splice(adjustedPosition, 0, draggedElement);
    setCurrentLayout(newLayout);
    trackEvent('layout_modified', { element: draggedElement.type });
  }, [currentLayout]);

  const getCurrentLayout = useCallback(() => currentLayout, [currentLayout]);

  const saveLayout = useCallback(() => {
    localStorage.setItem('editorLayout', JSON.stringify(currentLayout));
    trackEvent('layout_saved', { elementCount: currentLayout.length });
  }, [currentLayout]);

  useEffect(() => {
    initEditor();
  }, [initEditor]);

  return (
    <div className="editor-container">
      <div className="preview-area">
        {currentLayout.map((element, index) => (
          <div 
            key={element.id}
            draggable
            className="editor-element"
            onDragStart={(e) => handleDragStart(e, element)}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, index)}
          >
            {element.type}
          </div>
        ))}
      </div>
      <button onClick={saveLayout} className="save-button">
        Save Layout
      </button>
    </div>
  );
};

export default DragDropEditor;