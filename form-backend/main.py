from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import torch
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import cv2
import io
import os
import uuid
import timm
from datetime import datetime, timedelta
import asyncio
import httpx
import motor.motor_asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MongoDB Setup ---
MONGO_DETAILS = "mongodb://localhost:27017"
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
db = client.digital_twin_db


# async def telemetry_loop():
#     async with httpx.AsyncClient() as http_client:
#         while True:
#             try:
#                 # 1. Fetch Real Weather + Soil Moisture for Blida, Algeria
#                 res = await http_client.get(
#                     "https://api.open-meteo.com/v1/forecast?latitude=36.62&longitude=3.22&current=temperature_2m,relative_humidity_2m,soil_moisture_0_to_7cm,shortwave_radiation"
#                 )
#                 weather_data = res.json().get("current", {})

#                 # 2. Virtual Sensors (Stochastic Simulation)
#                 co2_level = 400 + np.random.uniform(-5, 15)
#                 ph_level = 5.8 + np.random.uniform(-0.2, 0.2)
#                 power_draw = 50 + np.random.uniform(-2, 5)

#                 # 3. Correlate with AI (How many infections detected in the last minute?)
#                 one_min_ago = datetime.now() - timedelta(seconds=60)
#                 new_infections = await db.inference_logs.count_documents(
#                     {
#                         "timestamp": {"$gte": one_min_ago},
#                         "$or": [
#                             {"type": "scout", "label": {"$ne": "healthy"}},
#                             {
#                                 "type": "deep_analysis",
#                                 "detected_labels": {"$elemMatch": {"$ne": "healthy"}},
#                             },
#                         ],
#                     }
#                 )

#                 # 4. Save to Database
#                 doc = {
#                     "timestamp": datetime.now(),
#                     "temperature": weather_data.get("temperature_2m", 22),
#                     "humidity": weather_data.get("relative_humidity_2m", 50),
#                     "soil_moisture": weather_data.get("soil_moisture_0_to_7cm", 0.3),
#                     "co2": round(co2_level, 2),
#                     "light": weather_data.get("shortwave_radiation", 800),
#                     "ph": round(ph_level, 2),
#                     "power": round(power_draw, 2),
#                     "new_infections": new_infections,
#                 }
#                 await db.telemetry_history.insert_one(doc)
#             except Exception as e:
#                 print("Telemetry error:", e)


#             await asyncio.sleep(60)
# --- Background Task: Virtual IoT Sensors & Telemetry ---
async def telemetry_loop():
    async with httpx.AsyncClient() as http_client:
        while True:
            try:
                # 1. Fetch Real Weather + Soil Moisture for Blida, Algeria
                res = await http_client.get(
                    "https://api.open-meteo.com/v1/forecast?latitude=36.62&longitude=3.22&current=temperature_2m,relative_humidity_2m,soil_moisture_0_to_7cm,shortwave_radiation"
                )
                weather_data = res.json().get("current", {})
                humidity = weather_data.get("relative_humidity_2m", 50)

                # 2. Virtual Sensors (Stochastic Simulation)
                co2_level = 400 + np.random.uniform(-5, 15)
                ph_level = 5.8 + np.random.uniform(-0.2, 0.2)
                power_draw = 50 + np.random.uniform(-2, 5)

                # 🟢 LE POINT 4 : Moteur de propagation spatiale (Simulation Digital Twin)
                # 🟢 LE POINT 4 : Moteur de propagation spatiale (Simulation Digital Twin)
                base_spread_factor = 0.1
                if humidity > 85:
                    base_spread_factor = 0.6  # Très contagieux
                elif humidity > 65:
                    base_spread_factor = 0.3

                # On récupère les ID des plantes actuellement malades (score < 100)
                sick_nodes_cursor = db.nodes.find({"health_score": {"$lt": 100}})
                sick_nodes = await sick_nodes_cursor.to_list(length=72)
                sick_ids = [n["node_id"] for n in sick_nodes]

                for i in range(72):
                    if i not in sick_ids:
                        # 1. Définition de la Zone de Voisinage (Rayon d'Infection)
                        # -1, +1 : Voisins directs (gauche/droite)
                        # -4, -5, -6 : Voisins de la rangée précédente (irrégulière)
                        # +4, +5, +6 : Voisins de la rangée suivante (irrégulière)
                        potential_neighbors = [
                            i - 1,
                            i + 1,
                            i - 4,
                            i - 5,
                            i - 6,
                            i + 4,
                            i + 5,
                            i + 6,
                        ]

                        valid_neighbors = []
                        for n in potential_neighbors:
                            if 0 <= n < 72:
                                # 2. SÉCURITÉ DU COULOIR (La Barrière Physique)
                                # Table Gauche = 0 à 45 | Table Droite = 46 à 71
                                if (i <= 45 and n > 45) or (i > 45 and n <= 45):
                                    continue  # On bloque la propagation à travers le couloir central

                                valid_neighbors.append(n)

                        # 3. On compte combien de plantes malades sont dans ce rayon valide
                        infected_neighbors = sum(
                            1 for neighbor in valid_neighbors if neighbor in sick_ids
                        )

                        if infected_neighbors > 0:
                            # Calcul de probabilité (Si beaucoup de voisins malades, on plafonne l'impact pour ne pas exploser à 500%)
                            # On divise par 2 l'impact car la zone de recherche est plus large qu'avant
                            risk = min(
                                1.0, (infected_neighbors * base_spread_factor)
                            )
                            trend = "at_risk" if risk > 0.3 else "stable"

                            await db.nodes.update_one(
                                {"node_id": i},
                                {
                                    "$set": {
                                        "spread_risk": round(risk, 2),
                                        "trend": trend,
                                    }
                                },
                            )
                        else:
                            await db.nodes.update_one(
                                {"node_id": i},
                                {"$set": {"spread_risk": 0.0, "trend": "stable"}},
                            )
                # base_spread_factor = 0.1
                # if humidity > 85:
                #     base_spread_factor = 0.6  # Très contagieux
                # elif humidity > 65:
                #     base_spread_factor = 0.3

                # # On récupère les ID des plantes actuellement malades (score < 100)
                # sick_nodes_cursor = db.nodes.find({"health_score": {"$lt": 100}})
                # sick_nodes = await sick_nodes_cursor.to_list(length=72)
                # sick_ids = [n["node_id"] for n in sick_nodes]

                # for i in range(72):
                #     if i not in sick_ids:
                #         # Simulation d'une grille (voisins directs : gauche, droite, devant, derrière)
                #         neighbors = [i - 1, i + 1, i - 10, i + 10]

                #         # Filtrer pour s'assurer qu'on reste dans les limites de la serre (0 à 71)
                #         valid_neighbors = [n for n in neighbors if 0 <= n < 72]
                #         infected_neighbors = sum(
                #             1 for neighbor in valid_neighbors if neighbor in sick_ids
                #         )

                #         if infected_neighbors > 0:
                #             # Calcul de probabilité d'infection spatiale
                #             risk = min(1.0, infected_neighbors * base_spread_factor)
                #             trend = "at_risk" if risk > 0.4 else "stable"

                #             # Mise à jour du noeud voisin
                #             await db.nodes.update_one(
                #                 {"node_id": i},
                #                 {
                #                     "$set": {
                #                         "spread_risk": round(risk, 2),
                #                         "trend": trend,
                #                     }
                #                 },
                #             )
                #         else:
                #             # Remise à zéro si aucun voisin malade
                #             await db.nodes.update_one(
                #                 {"node_id": i},
                #                 {"$set": {"spread_risk": 0.0, "trend": "stable"}},
                #             )

                # 3. Correlate with AI (How many infections detected in the last minute?)
                one_min_ago = datetime.now() - timedelta(seconds=60)
                new_infections = await db.inference_logs.count_documents(
                    {
                        "timestamp": {"$gte": one_min_ago},
                        "$or": [
                            {"type": "scout", "label": {"$ne": "healthy"}},
                            {
                                "type": "deep_analysis",
                                "detected_labels": {"$elemMatch": {"$ne": "healthy"}},
                            },
                        ],
                    }
                )

                # 4. Save to Database
                doc = {
                    "timestamp": datetime.now(),
                    "temperature": weather_data.get("temperature_2m", 22),
                    "humidity": humidity,
                    "soil_moisture": weather_data.get("soil_moisture_0_to_7cm", 0.3),
                    "co2": round(co2_level, 2),
                    "light": weather_data.get("shortwave_radiation", 800),
                    "ph": round(ph_level, 2),
                    "power": round(power_draw, 2),
                    "new_infections": new_infections,
                }
                await db.telemetry_history.insert_one(doc)
            except Exception as e:
                print("Telemetry error:", e)

            await asyncio.sleep(60)  # Runs every 60 seconds


@app.on_event("startup")
async def startup_db_client():
    # Seed the Knowledge Base if it's empty
    kb_count = await db.knowledge_base.count_documents({})
    if kb_count == 0:
        initial_kb = [
            {
                "disease": "healthy",
                "advice": "Plant is in optimal condition. Maintain standard watering, nutrition, and monitoring routines.",
            },
            {
                "disease": "scab",
                "advice": "Fungal infection. Apply fungicides like Captan or Mancozeb. Rake and destroy fallen infected leaves to reduce spores.",
            },
            {
                "disease": "frog_eye_leaf_spot",
                "advice": "Fungal disease (Botryosphaeria). Prune and destroy dead or cankered wood where the fungus overwinters.",
            },
            {
                "disease": "rust",
                "advice": "Cedar Apple Rust detected. Apply preventive fungicides containing myclobutanil. Inspect nearby areas for alternative hosts.",
            },
            {
                "disease": "powdery_mildew",
                "advice": "Fungal detection. Apply sulfur-based fungicides or potassium bicarbonate. Improve air circulation by pruning.",
            },
            {
                "disease": "complex",
                "advice": "Multiple concurrent pathogens detected. Implement a rigorous broad-spectrum fungicide program. Isolate the plant immediately.",
            },
        ]
        await db.knowledge_base.insert_many(initial_kb)
    node_count = await db.nodes.count_documents({})
    if node_count == 0:
        nodes_data = []
        for i in range(72):
            nodes_data.append(
                {
                    "node_id": i,
                    "health_score": 100,  # 100% = en pleine forme
                    "disease_history": [],
                    "trend": "stable",  # peut être 'stable', 'degrading', 'at_risk'
                    "spread_risk": 0.0,  # Probabilité d'être infecté par un voisin
                }
            )
        await db.nodes.insert_many(nodes_data)

    # Start the IoT loop
    asyncio.create_task(telemetry_loop())


# --- Shared Transform ---
transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ]
)

# --- Load Models ---
DISEASE_CLASSES = [
    "complex",
    "frog_eye_leaf_spot",
    "healthy",
    "powdery_mildew",
    "rust",
    "scab",
]
disease_model = timm.create_model(
    "efficientnet_lite0", pretrained=False, num_classes=len(DISEASE_CLASSES)
)
disease_model.load_state_dict(torch.load("model.pth", map_location="cpu"))
disease_model.eval()

SCOUT_REAL_CLASSES = [
    "complex",
    "frog_eye_leaf_spot",
    "healthy",
    "powdery_mildew",
    "rust",
    "scab",
]
scout_model = timm.create_model("efficientnet_lite0", pretrained=False, num_classes=6)
scout_model.load_state_dict(torch.load("scout_model.pth", map_location="cpu"))
scout_model.eval()


# --- Grad-CAM ---
def generate_gradcam(model, input_tensor, original_image):
    gradients, activations = [], []

    def backward_hook(module, grad_in, grad_out):
        gradients.append(grad_out[0])

    def forward_hook(module, input, output):
        activations.append(output)

    target_layer = model.blocks[-1]
    handle_f = target_layer.register_forward_hook(forward_hook)
    handle_b = target_layer.register_full_backward_hook(backward_hook)

    output = model(input_tensor)
    pred_class = output.argmax(dim=1).item()
    model.zero_grad()
    output[0, pred_class].backward()

    handle_f.remove()
    handle_b.remove()

    grad = gradients[0].squeeze().mean(dim=(1, 2), keepdim=True)
    cam = (activations[0].squeeze() * grad).sum(dim=0).relu().detach().numpy()
    cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
    cam = cv2.resize(cam, (original_image.width, original_image.height))
    heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
    orig_np = np.array(original_image.convert("RGB"))[:, :, ::-1]
    return cv2.addWeighted(orig_np, 0.5, heatmap, 0.5, 0)


# --- Endpoint 1: Full Disease Diagnosis (MongoDB Integrated) ---
@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    contents = await image.read()
    pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
    input_tensor = transform(pil_image).unsqueeze(0)
    input_tensor.requires_grad_(True)

    with torch.set_grad_enabled(True):
        outputs = disease_model(input_tensor)
        probs = torch.sigmoid(outputs)[0]

    confidences = []
    for i in range(len(DISEASE_CLASSES)):
        disease_key = DISEASE_CLASSES[i]

        # Fetch dynamic recommendation from MongoDB Knowledge Base!
        kb_entry = await db.knowledge_base.find_one({"disease": disease_key})
        advice = kb_entry["advice"] if kb_entry else "Consult local guidelines."

        confidences.append(
            {"label": disease_key, "confidence": float(probs[i]), "advice": advice}
        )

    confidences.sort(key=lambda x: x["confidence"], reverse=True)

    try:
        heatmap_overlay = generate_gradcam(disease_model, input_tensor, pil_image)
        heatmap_filename = f"heatmap_{uuid.uuid4().hex}.jpg"
        heatmap_path = os.path.join(os.path.dirname(__file__), heatmap_filename)
        cv2.imwrite(heatmap_path, heatmap_overlay)
        heatmap_id = heatmap_filename
    except Exception:
        heatmap_id = None

    detected_labels = [c["label"] for c in confidences if c["confidence"] >= 0.30]

    # Fallback: if nothing is >= 15%, just take the highest score
    if len(detected_labels) == 0:
        detected_labels = [confidences[0]["label"]]

    # Log deep analysis to DB
    await db.inference_logs.insert_one(
        {
            "timestamp": datetime.now(),
            "type": "deep_analysis",
            "top_detected": detected_labels,
            "heatmap_id": heatmap_id,
        }
    )

    return JSONResponse({"confidences": confidences, "heatmap_id": heatmap_id})


# @app.post("/scout")
# async def scout(image: UploadFile = File(...)):
#     contents = await image.read()
#     pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
#     input_tensor = transform(pil_image).unsqueeze(0)

#     with torch.no_grad():
#         outputs = scout_model(input_tensor)
#         probs = torch.softmax(outputs, dim=1)[0]

#     predicted_index = probs.argmax().item()
#     real_label = SCOUT_REAL_CLASSES[predicted_index]
#     confidence = float(probs[predicted_index])

#     final_label = "healthy" if real_label == "healthy" else "unhealthy"

#     await db.inference_logs.insert_one(
#         {
#             "timestamp": datetime.now(),
#             "type": "scout",
#             "label": real_label,
#             "confidence": confidence,
#         }
#     )


#     return JSONResponse({"label": final_label, "confidence": confidence})
@app.post("/scout")
async def scout(
    image: UploadFile = File(...), node_id: int = Form(-1)
):  # 🟢 Accepte node_id
    contents = await image.read()
    pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
    input_tensor = transform(pil_image).unsqueeze(0)

    with torch.no_grad():
        outputs = scout_model(input_tensor)
        probs = torch.softmax(outputs, dim=1)[0]

    predicted_index = probs.argmax().item()
    real_label = SCOUT_REAL_CLASSES[predicted_index]
    confidence = float(probs[predicted_index])
    final_label = "healthy" if real_label == "healthy" else "unhealthy"

    # 🟢 LE POINT 5 (Historisation par noeud)
    if node_id != -1:
        if real_label != "healthy":
            # La plante est malade, on dégrade son score et on ajoute à l'historique
            await db.nodes.update_one(
                {"node_id": node_id},
                {
                    "$set": {"trend": "degrading"},
                    "$inc": {"health_score": -15},  # On baisse sa santé
                    "$push": {
                        "disease_history": {
                            "timestamp": datetime.now(),
                            "pathogen": real_label,
                            "confidence": confidence,
                        }
                    },
                },
            )
        else:
            # Plante saine, on remonte doucement sa santé
            await db.nodes.update_one(
                {"node_id": node_id, "health_score": {"$lt": 100}},
                {"$inc": {"health_score": 5}, "$set": {"trend": "improving"}},
            )

    # 🟢 SAUVEGARDE CLASSIQUE (L'erreur était ici avec les trois points)
    await db.inference_logs.insert_one(
        {
            "timestamp": datetime.now(),
            "type": "scout",
            "label": real_label,
            "confidence": confidence,
        }
    )

    return JSONResponse({"label": final_label, "confidence": confidence})


# --- NEW: Analytics Endpoint ---
@app.get("/analytics/data")
async def get_analytics():
    # Fetch the last 20 minutes of telemetry from MongoDB
    cursor = db.telemetry_history.find().sort("timestamp", -1).limit(20)
    docs = await cursor.to_list(length=20)
    docs.reverse()  # Put in chronological order for the charts

    formatted_data = []
    for d in docs:
        time_str = d["timestamp"].strftime("%H:%M")
        formatted_data.append(
            {
                "time": time_str,
                "humidity": d["humidity"],
                "temp": d["temperature"],
                "soil": d.get("soil_moisture", 0.3) * 100,  # convert 0.3 to 30%
                "newInfections": d["new_infections"],
                "co2": d["co2"],
                "ph": d["ph"],
                "light": d.get("light", 800),
                "power": d["power"],
            }
        )

    return JSONResponse(formatted_data)


@app.get("/heatmap/{filename}")
async def get_heatmap(filename: str):
    path = os.path.join(os.path.dirname(__file__), filename)
    if os.path.exists(path):
        return FileResponse(path, media_type="image/jpeg")
    return JSONResponse({"error": "Not found"}, status_code=404)


@app.get("/analytics/distribution")
async def get_disease_distribution():
    # 1. On cherche d'abord dans les analyses profondes (Multi-labels) des dernières 24h
    one_day_ago = datetime.now() - timedelta(days=1)
    cursor = db.inference_logs.find(
        {"timestamp": {"$gte": one_day_ago}, "type": "deep_analysis"}
    )
    logs = await cursor.to_list(length=1000)

    distribution = {}

    # On compte chaque maladie trouvée dans les tableaux "detected_labels"
    for log in logs:
        labels = log.get("top_detected", []) or log.get("detected_labels", [])
        if isinstance(labels, list):
            for label in labels:
                if label != "healthy":
                    distribution[label] = distribution.get(label, 0) + 1

    # 2. S'il n'y a pas encore d'analyse profonde, on prend l'état du Scout (Fallback)
    if not distribution:
        scout_cursor = db.nodes.find({"health_score": {"$lt": 100}})
        scout_nodes = await scout_cursor.to_list(length=72)
        for node in scout_nodes:
            history = node.get("disease_history", [])
            if history:
                last_disease = history[-1].get("pathogen")
                if last_disease and last_disease != "healthy":
                    distribution[last_disease] = distribution.get(last_disease, 0) + 1

    # 3. Formatage pour le composant Recharts du Frontend React
    chart_data = []
    # Palette de couleurs pour le graphique
    colors = ["#EF4444", "#F59E0B", "#EAB308", "#84CC16", "#3B82F6", "#8B5CF6"]

    color_index = 0
    for k, v in distribution.items():
        formatted_name = k.replace(
            "_", " "
        ).title()  # ex: "powdery_mildew" -> "Powdery Mildew"
        chart_data.append(
            {
                "name": formatted_name,
                "value": v,
                "fill": colors[color_index % len(colors)],
            }
        )
        color_index += 1

    return JSONResponse(chart_data)


@app.get("/api/nodes")
async def get_all_nodes():
    # Récupère l'état des 72 plantes depuis MongoDB
    cursor = db.nodes.find({}, {"_id": 0})
    nodes = await cursor.to_list(length=72)

    # 🟢 LA CORRECTION : Transformer les objets "datetime" en texte (String)
    for node in nodes:
        for history in node.get("disease_history", []):
            if "timestamp" in history and isinstance(history["timestamp"], datetime):
                history["timestamp"] = history["timestamp"].isoformat()

    return JSONResponse(nodes)
