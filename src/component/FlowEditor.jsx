import React, { useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";

import { getLayoutedElements } from "../utils/dagreUtils";
import { pageHierarchy } from "../utils/data";
import HomeSections from "./HomeSections";

const FlowEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Connect handler
  const onConnect = (params) =>
    setEdges((eds) => addEdge({ ...params, animated: true }, eds));

  // Load initial layout
useEffect(() => {
    const savedNodes = localStorage.getItem("flow-nodes");
    const savedEdges = localStorage.getItem("flow-edges");

   
      const rawNodes = pageHierarchy?.length
        ? pageHierarchy.map((page) => ({
            id: page.id,
            data: {
              label:
                page.id === "home" ? (
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-2">Home</h2>
                    <HomeSections />
                  </div>
                ) : (
                  <div className="text-center font-medium">{page.label}</div>
                ),
            },
            position: page.id === "home" ? { x: 200, y: 50 } : { x: 0, y: 0 },
            draggable: page.id !== "home",
            connectable: page.id !== "home",
            dragHandle: false,
            selectable: true,
            deletable: page.id !== "home",
            style: {
              backgroundColor: getColor(page),
              borderRadius: 12,
              padding: 10,
              border: "1px solid #ccc",
              width: page.id === "home" ? 500 : 200,
              height: page.id === "home" ? 600 : "auto",
              overflow: "hidden",
              cursor: page.id === "home" ? "default" : "grab",
            },
          }))
        : [];

            const rawEdges = pageHierarchy?.length
        ? pageHierarchy
            .filter((p) => p.parent)
            .map((p) => ({
              id: `${p.parent}-${p.id}`,
              source: p.parent,
              target: p.id,
              animated: true,
            }))
        : [];

      const layouted = getLayoutedElements(rawNodes, rawEdges, "TB");

      // 🔒 Re-lock the "home" position after layout
      const homeIndex = layouted.nodes.findIndex((n) => n.id === "home");
      if (homeIndex !== -1) {
        layouted.nodes[homeIndex].position = { x: 200, y: 50 };
        layouted.nodes[homeIndex].draggable = false;
        layouted.nodes[homeIndex].connectable = false;
      }

      setNodes(layouted.nodes);
      setEdges(layouted.edges);
      }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("flow-nodes", JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem("flow-edges", JSON.stringify(edges));
  }, [edges]);

  return (
    <div className="w-full h-[860px] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

// Utility to assign node color
const getColor = (page) => {
  if (!page.parent) return "#fcd34d"; // Home - Yellow
  const grandparent = pageHierarchy.find((p) => p.id === page.parent)?.parent;
  return grandparent ? "#fca5a5" : "#a5f3fc"; // Nested - Red, Direct child - Cyan
};

export default FlowEditor;
