import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSections, resetSections } from './redux/homeSlice';
import FlowEditor from './component/FlowEditor';
import ControlPanel from './component/ControlPanel';
import { pageHierarchy } from './utils/data';


const App = () => {
  const sections = useSelector((state) => state.home.sections);
  const dispatch = useDispatch();

  const handleSave = () => {
    localStorage.setItem('homeSections', JSON.stringify(sections));
    alert('Saved to localStorage!');
  };

  const handleLoad = () => {
    const data = localStorage.getItem('homeSections');
    if (data) dispatch(setSections(JSON.parse(data)));
  };

const handleExport = () => {
  const savedNodesRaw = localStorage.getItem("flow-nodes");
  const savedEdgesRaw = localStorage.getItem("flow-edges");

  if (!savedNodesRaw || !savedEdgesRaw) {
    alert("Flow data not found in localStorage. Please create and save your flow first.");
    return;
  }

  let savedNodes, savedEdges;

  try {
    savedNodes = JSON.parse(savedNodesRaw);
    savedEdges = JSON.parse(savedEdgesRaw);
  } catch (e) {
    alert("Failed to parse flow data. Please try again.");
    return;
  }

  if (!Array.isArray(savedNodes) || !Array.isArray(savedEdges)) {
    alert("Flow data is not in expected format. Please interact with the flow first.");
    return;
  }

  const nodeMap = {};
  const childrenMap = {};

  savedNodes.forEach((node) => {
    nodeMap[node.id] = {
      id: node.id,
      label:
        typeof node.data.label === "string"
          ? node.data.label
          : node.id.charAt(0).toUpperCase() + node.id.slice(1),
    };
  });

  savedEdges.forEach((edge) => {
    if (!childrenMap[edge.source]) {
      childrenMap[edge.source] = [];
    }
    childrenMap[edge.source].push(edge.target);

    if (nodeMap[edge.target]) {
      nodeMap[edge.target].parent = edge.source;
    }
  });

  for (const parentId in childrenMap) {
    if (nodeMap[parentId]) {
      nodeMap[parentId].children = childrenMap[parentId];
    }
  }

  if (nodeMap["home"]) {
    nodeMap["home"].sections = sections;
  }

  const pageHierarchyFormat = Object.values(nodeMap);

  const blob = new Blob([JSON.stringify(pageHierarchyFormat, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pageHierarchy.json";
  a.click();
  URL.revokeObjectURL(url);
};


  return (
    <div className="p-6">
      <ControlPanel onSave={handleSave} onLoad={handleLoad} onExport={handleExport} onReset={() => dispatch(resetSections())} />
      <h1 className="text-xl font-bold mb-8 mt-6">Visual Page Hierarchy Editor</h1>
      <FlowEditor />
      {/* <h2 className="mt-8 font-semibold">Home Page Sections</h2> */}

    </div>
  );
};

export default App;