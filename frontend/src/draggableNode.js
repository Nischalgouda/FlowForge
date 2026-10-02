// draggableNode.js — Improved draggable node tile for toolbar

export const DraggableNode = ({ type, label, icon = '', color = 'var(--accent)' }) => {
  const onDragStart = (event, nodeType) => {
    const appData = { nodeType };
    event.target.style.cursor = 'grabbing';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      id={`draggable-${type}`}
      className={`${type} flex flex-col items-center justify-center gap-1.5 w-[72px] h-[72px] rounded-xl border border-[var(--rule)] bg-[var(--bg)] shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[var(--accent)]`}
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={(event) => (event.target.style.cursor = 'grab')}
      draggable
      title={`Drag to add ${label} node`}
      style={{
        cursor: 'grab',
        borderTop: `2px solid ${color}`,
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span className="text-[10px] font-medium tracking-wide text-[var(--ink-soft)]">
        {label}
      </span>
    </div>
  );
};