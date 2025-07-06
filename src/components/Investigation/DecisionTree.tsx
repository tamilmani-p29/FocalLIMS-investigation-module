import React, { useCallback, useState } from 'react';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CheckCircle, AlertCircle, Clock, FileText, Plus, X, Check } from 'lucide-react';

interface DecisionNodeData {
  label: string;
  description: string;
  status: 'pending' | 'current' | 'completed';
  type: 'decision' | 'action' | 'end';
  requirements?: string[];
  checklist?: { id: string; text: string; checked: boolean }[];
  actions?: { id: string; text: string; type: 'issue' | 'no-issue' | 'complete' }[];
}

const DecisionNode = ({ data, selected }: { data: DecisionNodeData; selected: boolean }) => {
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklist, setChecklist] = useState(data.checklist || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const getStatusIcon = () => {
    switch (data.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'current':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const getStatusColor = () => {
    switch (data.status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'current':
        return 'border-blue-500 bg-blue-50 shadow-lg';
      default:
        return 'border-gray-300 bg-white';
    }
  };
  
  const getTypeIcon = () => {
    switch (data.type) {
      case 'decision':
        return '?';
      case 'action':
        return '!';
      case 'end':
        return '✓';
      default:
        return '•';
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem = {
        id: Date.now().toString(),
        text: newChecklistItem.trim(),
        checked: false
      };
      setChecklist(prev => [...prev, newItem]);
      setNewChecklistItem('');
    }
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const handleAction = (actionType: string) => {
    console.log(`Action triggered: ${actionType} for node ${data.label}`);
    // Here you would implement the actual action logic
  };
  
  return (
    <div className={`px-4 py-3 rounded-lg border-2 ${getStatusColor()} ${selected ? 'ring-2 ring-blue-500' : ''} min-w-[280px] max-w-[350px] relative`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-400" />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
            {getTypeIcon()}
          </div>
          {getStatusIcon()}
        </div>
        <button
          onClick={() => setShowChecklist(!showChecklist)}
          className="text-gray-400 hover:text-gray-600"
        >
          <FileText className="h-4 w-4" />
        </button>
      </div>
      
      <h3 className="font-medium text-gray-900 text-sm mb-1">{data.label}</h3>
      <p className="text-xs text-gray-600 mb-3">{data.description}</p>
      
      {data.requirements && data.requirements.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-700">Requirements:</p>
          <ul className="text-xs text-gray-600 mt-1">
            {data.requirements.map((req, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-1">•</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-1 mb-2">
        {data.type === 'decision' && (
          <>
            <button
              onClick={() => handleAction('issue-found')}
              className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 flex items-center space-x-1"
            >
              <AlertCircle className="h-3 w-3" />
              <span>Issue Found</span>
            </button>
            <button
              onClick={() => handleAction('no-issue')}
              className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 flex items-center space-x-1"
            >
              <CheckCircle className="h-3 w-3" />
              <span>No Issue</span>
            </button>
          </>
        )}
        {data.type === 'action' && (
          <button
            onClick={() => handleAction('mark-complete')}
            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 flex items-center space-x-1"
          >
            <Check className="h-3 w-3" />
            <span>Mark Complete</span>
          </button>
        )}
      </div>

      {/* Expandable Checklist */}
      {showChecklist && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Checklist</h4>
            <button
              onClick={() => setShowChecklist(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleChecklistItem(item.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-xs flex-1 ${item.checked ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                  {item.text}
                </span>
                <button
                  onClick={() => removeChecklistItem(item.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-1">
            <input
              type="text"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              placeholder="Add checklist item..."
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
            />
            <button
              onClick={addChecklistItem}
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  decision: DecisionNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'decision',
    position: { x: 400, y: 50 },
    data: { 
      label: 'Deviation Detected',
      description: 'Initial deviation observation and documentation',
      status: 'completed',
      type: 'action',
      requirements: ['Document deviation', 'Notify supervisor'],
      checklist: [
        { id: '1', text: 'Document deviation details', checked: true },
        { id: '2', text: 'Notify lab supervisor', checked: true },
        { id: '3', text: 'Secure samples and evidence', checked: true }
      ]
    },
  },
  {
    id: '2',
    type: 'decision',
    position: { x: 400, y: 220 },
    data: { 
      label: 'Immediate Investigation Required?',
      description: 'Assess if immediate investigation is needed based on severity',
      status: 'current',
      type: 'decision',
      requirements: ['Assess severity', 'Check regulatory requirements'],
      checklist: [
        { id: '1', text: 'Evaluate deviation severity', checked: true },
        { id: '2', text: 'Check regulatory impact', checked: false },
        { id: '3', text: 'Review customer impact', checked: false }
      ]
    },
  },
  {
    id: '3',
    type: 'decision',
    position: { x: 150, y: 390 },
    data: { 
      label: 'Conduct Immediate Investigation',
      description: 'Perform immediate investigation for critical deviations',
      status: 'pending',
      type: 'action',
      requirements: ['Secure evidence', 'Interview personnel', 'Document findings'],
      checklist: [
        { id: '1', text: 'Secure all evidence', checked: false },
        { id: '2', text: 'Interview involved personnel', checked: false },
        { id: '3', text: 'Document initial findings', checked: false }
      ]
    },
  },
  {
    id: '4',
    type: 'decision',
    position: { x: 650, y: 390 },
    data: { 
      label: 'Schedule Investigation',
      description: 'Plan and schedule investigation for non-critical deviations',
      status: 'pending',
      type: 'action',
      requirements: ['Assign investigator', 'Set timeline', 'Define scope'],
      checklist: [
        { id: '1', text: 'Assign qualified investigator', checked: false },
        { id: '2', text: 'Set investigation timeline', checked: false },
        { id: '3', text: 'Define investigation scope', checked: false }
      ]
    },
  },
  {
    id: '5',
    type: 'decision',
    position: { x: 400, y: 560 },
    data: { 
      label: 'Root Cause Analysis',
      description: 'Perform comprehensive root cause analysis',
      status: 'pending',
      type: 'action',
      requirements: ['Collect data', 'Analyze causes', 'Validate findings'],
      checklist: [
        { id: '1', text: 'Collect all relevant data', checked: false },
        { id: '2', text: 'Apply RCA methodology', checked: false },
        { id: '3', text: 'Validate root cause findings', checked: false }
      ]
    },
  },
  {
    id: '6',
    type: 'decision',
    position: { x: 400, y: 730 },
    data: { 
      label: 'CAPA Required?',
      description: 'Determine if corrective and preventive actions are needed',
      status: 'pending',
      type: 'decision',
      requirements: ['Assess risk', 'Review regulations', 'Evaluate impact'],
      checklist: [
        { id: '1', text: 'Assess recurrence risk', checked: false },
        { id: '2', text: 'Review regulatory requirements', checked: false },
        { id: '3', text: 'Evaluate business impact', checked: false }
      ]
    },
  },
  {
    id: '7',
    type: 'decision',
    position: { x: 150, y: 900 },
    data: { 
      label: 'Implement CAPA',
      description: 'Implement corrective and preventive actions',
      status: 'pending',
      type: 'action',
      requirements: ['Define actions', 'Assign responsibility', 'Set timelines'],
      checklist: [
        { id: '1', text: 'Define corrective actions', checked: false },
        { id: '2', text: 'Define preventive actions', checked: false },
        { id: '3', text: 'Assign responsibilities', checked: false }
      ]
    },
  },
  {
    id: '8',
    type: 'decision',
    position: { x: 650, y: 900 },
    data: { 
      label: 'Document & Close',
      description: 'Document findings and close investigation',
      status: 'pending',
      type: 'action',
      requirements: ['Prepare report', 'Review findings', 'Archive documents'],
      checklist: [
        { id: '1', text: 'Prepare final report', checked: false },
        { id: '2', text: 'Get management review', checked: false },
        { id: '3', text: 'Archive all documents', checked: false }
      ]
    },
  },
  {
    id: '9',
    type: 'decision',
    position: { x: 400, y: 1070 },
    data: { 
      label: 'Effectiveness Review',
      description: 'Review effectiveness of implemented actions',
      status: 'pending',
      type: 'action',
      requirements: ['Monitor results', 'Validate effectiveness', 'Update procedures'],
      checklist: [
        { id: '1', text: 'Monitor implementation results', checked: false },
        { id: '2', text: 'Validate action effectiveness', checked: false },
        { id: '3', text: 'Update procedures if needed', checked: false }
      ]
    },
  },
  {
    id: '10',
    type: 'decision',
    position: { x: 400, y: 1240 },
    data: { 
      label: 'Investigation Complete',
      description: 'Investigation successfully completed',
      status: 'pending',
      type: 'end',
      checklist: [
        { id: '1', text: 'All actions completed', checked: false },
        { id: '2', text: 'Documentation finalized', checked: false },
        { id: '3', text: 'Lessons learned captured', checked: false }
      ]
    },
  },
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    label: 'Next',
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#6b7280', strokeWidth: 2 },
    labelStyle: { fill: '#374151', fontWeight: 600 },
    markerEnd: { type: 'arrowclosed', color: '#6b7280' }
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3', 
    label: 'Yes - Critical',
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#dc2626', strokeWidth: 2 },
    labelStyle: { fill: '#dc2626', fontWeight: 600 },
    markerEnd: { type: 'arrowclosed', color: '#dc2626' }
  },
  { 
    id: 'e2-4', 
    source: '2', 
    target: '4', 
    label: 'No - Schedule',
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#059669', strokeWidth: 2 },
    labelStyle: { fill: '#059669', fontWeight: 600 },
    markerEnd: { type: 'arrowclosed', color: '#059669' }
  },
  { 
    id: 'e3-5', 
    source: '3', 
    target: '5', 
    label: 'Complete',
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#6b7280', strokeWidth: 2 },
    labelStyle: { fill: '#374151', fontWeight: 600 },
    markerEnd: { type: 'arrowclosed', color: '#6b7280' }
  },
  { 
    id: 'e4-5', 
    source: '4', 
    target: '5', 
    label: 'Begin',
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#6b7280', strokeWidth: 2 },
    labelStyle: { fill: '#374151', fontWeight: 600 },
    markerEnd: { type: 'arrowclosed', color: '#6b7280' }
  },
  { 
    id: 'e5-6', 
    source: '5', 
    target: '6', 
    label: 'Analysis Complete',
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#6b7280', strokeWidth: 2 },
    labelStyle: { fill: '#374151', fontWeight: 600 },
    markerEnd: { type: 'arrowclosed', color: '#6b7280' }
  },
  { 
    id: 'e6-7', 
    source: '6', 
    target: '7', 
    label: 'Yes - CAPA Needed',
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#dc2626', strokeWidth: 2 },
    labelStyle: { fill: '#dc2626', fontWeight: 600 },
    markerEnd: { type: 'arrowclosed', color: '#dc2626' }
  },
  { 
    id: 'e6-8', 
    source: '6', 
    target: '8', 
    label: 'No - Document Only',
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#059669', strokeWidth: 2 },
    labelStyle: { fill: '#059669', fontWeight: 600 },
    markerEnd: { type: 'arrowclosed', color: '#059669' }
  },
  { 
    id: 'e7-9', 
    source: '7', 
    target: '9', 
    label: 'Implemented',
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#6b7280', strokeWidth: 2 },
    labelStyle: { fill: '#374151', fontWeight: 600 },
    markerEnd: { type: 'arrowclosed', color: '#6b7280' }
  },
  { 
    id: 'e8-10', 
    source: '8', 
    target: '10', 
    label: 'Closed',
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#6b7280', strokeWidth: 2 },
    labelStyle: { fill: '#374151', fontWeight: 600 },
    markerEnd: { type: 'arrowclosed', color: '#6b7280' }
  },
  { 
    id: 'e9-10', 
    source: '9', 
    target: '10', 
    label: 'Validated',
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#6b7280', strokeWidth: 2 },
    labelStyle: { fill: '#374151', fontWeight: 600 },
    markerEnd: { type: 'arrowclosed', color: '#6b7280' }
  },
];

export function DecisionTree() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showAddNode, setShowAddNode] = useState(false);
  const [newNodeData, setNewNodeData] = useState({
    label: '',
    description: '',
    type: 'action' as 'decision' | 'action' | 'end'
  });
  
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#6b7280', strokeWidth: 2 },
        labelStyle: { fill: '#374151', fontWeight: 600 },
        markerEnd: { type: 'arrowclosed', color: '#6b7280' }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges],
  );
  
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  const addNewNode = () => {
    if (newNodeData.label && newNodeData.description) {
      const newNode: Node = {
        id: (nodes.length + 1).toString(),
        type: 'decision',
        position: { x: 400, y: 1400 + (nodes.length * 50) },
        data: {
          ...newNodeData,
          status: 'pending',
          checklist: []
        }
      };
      setNodes(prev => [...prev, newNode]);
      setNewNodeData({ label: '', description: '', type: 'action' });
      setShowAddNode(false);
    }
  };
  
  const currentNode = nodes.find(n => n.data.status === 'current');
  
  return (
    <div className="h-screen bg-gray-50">
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">MHRA Investigation Decision Tree</h2>
            <p className="text-sm text-gray-600 mt-1">Interactive workflow for deviation investigations with checklists and actions</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddNode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Node</span>
            </button>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>Pending</span>
              </div>
            </div>
          </div>
        </div>
        
        {currentNode && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Current Step: {currentNode.data.label}</h3>
                <p className="text-sm text-blue-700 mt-1">{currentNode.data.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="h-full" style={{ height: 'calc(100vh - 140px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="top-right"
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#6b7280', strokeWidth: 2 },
            markerEnd: { type: 'arrowclosed', color: '#6b7280' }
          }}
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
      
      {selectedNode && (
        <div className="absolute bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Step Details</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          {(() => {
            const node = nodes.find(n => n.id === selectedNode);
            if (!node) return null;
            
            return (
              <div>
                <h4 className="font-medium text-gray-800 mb-2">{node.data.label}</h4>
                <p className="text-sm text-gray-600 mb-3">{node.data.description}</p>
                {node.data.requirements && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {node.data.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                    Mark Complete
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    View Details
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Add Node Modal */}
      {showAddNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Node</h3>
              <button
                onClick={() => setShowAddNode(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node Label *
                </label>
                <input
                  type="text"
                  value={newNodeData.label}
                  onChange={(e) => setNewNodeData(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter node label..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={newNodeData.description}
                  onChange={(e) => setNewNodeData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the step or decision..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node Type
                </label>
                <select
                  value={newNodeData.type}
                  onChange={(e) => setNewNodeData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="action">Action</option>
                  <option value="decision">Decision</option>
                  <option value="end">End Point</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddNode(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addNewNode}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Add Node
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}