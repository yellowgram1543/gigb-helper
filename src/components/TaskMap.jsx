import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";

// Fix for default Leaflet marker icon
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function TaskMap({ tasks }) {
  const navigate = useNavigate();
  
  // Default to a central point (e.g., center of a city) if no tasks exist
  const center = tasks.length > 0 
    ? [tasks[0].location.lat, tasks[0].location.lng] 
    : [12.9716, 77.5946]; 

  return (
    <div style={{ height: "100%", minHeight: "500px", width: "100%", borderRadius: "12px", overflow: "hidden", border: "2px solid #e5e7eb" }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {tasks.map((task) => (
          <Marker 
            key={task._id} 
            position={[task.location.lat, task.location.lng]}
          >
            <Popup>
              <div style={{ padding: "5px", textAlign: "center" }}>
                <h3 style={{ margin: "0 0 5px", fontSize: "16px" }}>{task.title}</h3>
                <p style={{ margin: "0 0 10px", fontWeight: 700, color: "#2563eb", fontSize: "18px" }}>₹{task.budget}</p>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: "8px 16px", fontSize: "0.9rem", width: "100%", background: "#2563eb", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
                  onClick={() => navigate(`/task/${task._id}`)}
                >
                  View Job
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
