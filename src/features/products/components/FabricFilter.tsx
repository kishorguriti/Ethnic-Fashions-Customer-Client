import { Icon } from "@iconify/react";
import { Button } from "antd";
import React from "react";

const fabrics = [
  { name: "Silk", icon: "🧵" },
  { name: "Cotton", icon: "🌿" },
  { name: "Linen", icon: "🧶" },
  { name: "Chiffon", icon: "🎀" },
  { name: "Organza", icon: "🦋" },
  { name: "Satin", icon: "✨" },
];

const FabricFilter: React.FC = () => (
  <div>
    <div className="d-flex flex-column align-items-center">
      <Button
        type="primary"
        size="large"
        shape="round"
        className={"btnPrimary premium-fabric-btn"}
        style={{ maxWidth: "200px" }}
      >
        <Icon icon="mynaui:star-solid" width="24" height="24" /> Premium Fabrics
      </Button>
      <h1 className="fw-600 text-center special-font-cls mt-2 mb-4">
        Shop by Fabric
      </h1>
    </div>
    <div className="d-flex justify-content-center flex-wrap gap-5 py-4">
      {fabrics.map((f) => (
        <div key={f.name} className="text-center fabric-item">
          <div className="fabric-circle shadow-sm">
            {f.icon}
            <p className="mt-2 special-font-cls">{f.name}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default FabricFilter;
