# ROOMIFY — Interactive 3D Room Interior Designer & Space Planner

Roomify is an interactive web-based 3D and 2D cutaway room interior designer and space planner built with Three.js. It allows users to customize layouts, experiment with materials and lighting, manage furniture, and track budgets in real time.

## ✨ Key Features

- **3D & 2D Cutaway Designer:** Switch seamlessly between an interactive 3D viewport and a 2D cutaway floor plan.
- **Project Dashboard:** Save, organize, and manage multiple room design projects in one workspace.
- **Custom Materials & Lighting:** Apply different textures, colors, and dynamic lighting setups to visualize spaces accurately.
- **Furniture & Layout Tools:** Place, arrange, and customize furniture pieces with precision camera controls.
- **Real-Time Budget Tracking & Export:** Monitor design costs automatically and export finished room layouts.

---

## 📁 Folder Structure

```text
Roomify-v2/
├── index.html          # Landing page
├── dashboard.html      # "My Designs" workspace & project manager
├── editor.html         # Interactive 3D & 2D cutaway room designer
├── server.js           # Node.js / Express backend for Render & localhost
├── package.json        # Project dependencies and scripts
└── assets/
    ├── css/            # Modular stylesheets
    │   ├── style.css
    │   ├── dashboard.css
    │   └── editor.css
    └── js/             # Modular Three.js & application scripts
        ├── main.js
        ├── dashboard.js
        ├── room3d.js
        ├── furniture.js
        ├── materials.js
        ├── lighting.js
        ├── camera.js
        ├── budget.js
        └── export.js
