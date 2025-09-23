import NodeLinkGraph from "./components/NodeLinkGraph";

export default function App() {
  return (
    <div className="flex h-screen dark" style={{ backgroundColor: '#2C2C2C' }}>
      <NodeLinkGraph />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-medium text-[#E4E4E4] mb-4">
            Interactive Knowledge Graph
          </h1>
          <p className="text-[#B8B8B8] text-lg mb-8">
            Explore connections between historical people, events, and places through an interactive muted pastel visualization.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#3A3A3A] border border-[#4A4A4A] rounded-lg p-6">
              <h2 className="text-xl font-medium text-[#E4E4E4] mb-3">How to Use</h2>
              <ul className="text-[#B8B8B8] space-y-2">
                <li>• Hover over nodes to highlight connections</li>
                <li>• Click nodes to view detailed information</li>
                <li>• Animated links show causal relationships</li>
                <li>• Scroll the sidebar to see all nodes</li>
              </ul>
            </div>
            
            <div className="bg-[#3A3A3A] border border-[#4A4A4A] rounded-lg p-6">
              <h2 className="text-xl font-medium text-[#E4E4E4] mb-3">Node Categories</h2>
              <ul className="text-[#B8B8B8] space-y-3">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#B39CD0]"></div>
                  <span><span className="text-[#B39CD0] font-medium">People:</span> Historical figures and leaders</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#FFC1CC]"></div>
                  <span><span className="text-[#FFC1CC] font-medium">Events:</span> Major historical events and movements</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#A8DADC]"></div>
                  <span><span className="text-[#A8DADC] font-medium">Places:</span> Institutions and geographical locations</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 bg-[#3A3A3A] border border-[#4A4A4A] rounded-lg p-6">
            <h2 className="text-xl font-medium text-[#E4E4E4] mb-3">Design Philosophy</h2>
            <p className="text-[#B8B8B8] leading-relaxed">
              This visualization uses a <span className="text-[#B39CD0]">muted pastel palette</span> with soft blues, pinks, and lavenders against a dark background. 
              The design creates a serene yet sophisticated aesthetic that balances readability with visual appeal, perfect for exploring complex historical relationships.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}