// toolbar.js — toolbar using inline SVG icons

import { ICON_MAP } from './common/nodeIcons';

const NODE_GROUPS = [
  {
    label: 'Core',
    nodes: [
      { type: 'customInput',  label: 'Input',    iconKey: 'input'    },
      { type: 'llm',          label: 'LLM',      iconKey: 'llm'      },
      { type: 'customOutput', label: 'Output',   iconKey: 'output'   },
      { type: 'text',         label: 'Text',     iconKey: 'text'     },
    ],
  },
  {
    label: 'Utilities',
    nodes: [
      { type: 'database',  label: 'Database',  iconKey: 'database'  },
      { type: 'api',       label: 'API Call',  iconKey: 'api'       },
      { type: 'filter',    label: 'Filter',    iconKey: 'filter'    },
      { type: 'validator', label: 'Validator', iconKey: 'validator' },
      { type: 'transform', label: 'Transform', iconKey: 'transform' },
    ],
  },
];

const ToolbarTile = ({ type, label, iconKey }) => {
  const onDragStart = (e) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType: type }));
    e.dataTransfer.effectAllowed = 'move';
  };
  const Icon = ICON_MAP[iconKey] || ICON_MAP.input;

  return (
    <div
      id={`draggable-${type}`}
      draggable
      onDragStart={onDragStart}
      title={`Drag to add ${label}`}
      style={{ cursor: 'grab', fontFamily: "'Inter', sans-serif", userSelect: 'none' }}
      className="w-16 h-16 bg-[#FFFEFB] border border-[#D9D2C5] rounded-xl
                 flex flex-col items-center justify-center gap-1.5
                 hover:-translate-y-0.5 hover:shadow-md hover:border-[#584824]
                 transition-all duration-200"
    >
      <Icon size={24} />
      <span
        className="text-[8px] font-semibold uppercase text-[#584824]"
        style={{ letterSpacing: '0.07em' }}
      >
        {label}
      </span>
    </div>
  );
};

export const PipelineToolbar = ({ isSidebar }) => {
  return (
    <div 
      className={`relative group ${isSidebar ? 'border-r border-[#D9D2C5]' : 'border-b border-[#D9D2C5]'}`} 
      style={{ background: '#F5F2E8', height: isSidebar ? '100%' : 88, width: isSidebar ? 104 : '100%', flexShrink: 0 }}
    >
      <div
        className={`flex ${isSidebar ? 'flex-col items-center py-6 gap-8 h-full overflow-y-auto' : 'items-center gap-8 h-full px-6 overflow-x-auto'} shrink-0`}
        style={{ fontFamily: "'Inter', sans-serif", scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {NODE_GROUPS.map((group, gi) => (
          <div key={group.label} className={`flex ${isSidebar ? 'flex-col items-center' : 'items-center'} gap-4`}>
            {gi > 0 && <div className={isSidebar ? 'h-px w-10 bg-[#D9D2C5] shrink-0' : 'w-px h-10 bg-[#D9D2C5] shrink-0'} />}
            <div className={`flex ${isSidebar ? 'flex-col items-center' : 'items-center gap-3'}`}>
              <p
                className={`text-[9px] font-semibold uppercase text-[#88867D] ${isSidebar ? 'mb-2 text-center' : ''}`}
                style={{ letterSpacing: '0.1em' }}
              >
                {group.label}
              </p>
              <div className={`flex ${isSidebar ? 'flex-col' : 'items-center'} gap-2`}>
                {group.nodes.map(n => (
                  <ToolbarTile key={n.type} {...n} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
