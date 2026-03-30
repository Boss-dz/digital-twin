# from fastapi import FastAPI, File, UploadFile
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse, FileResponse
# import torch
# import torchvision.transforms as transforms
# from PIL import Image
# import numpy as np
# import cv2
# import io
# import os
# import uuid
# import timm

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # --- Model Setup ---
# CLASS_NAMES = [
#     "complex",
#     "frog_eye_leaf_spot",
#     "healthy",
#     "powdery_mildew",
#     "rust",
#     "scab",
# ]

# model = timm.create_model(
#     "efficientnet_lite0", pretrained=False, num_classes=len(CLASS_NAMES)
# )
# model.load_state_dict(torch.load("model.pth", map_location="cpu"))
# model.eval()

# transform = transforms.Compose(
#     [
#         transforms.Resize((224, 224)),
#         transforms.ToTensor(),
#         transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
#     ]
# )


# # --- Grad-CAM ---
# def generate_gradcam(model, input_tensor, original_image):
#     gradients = []
#     activations = []

#     def backward_hook(module, grad_in, grad_out):
#         gradients.append(grad_out[0])

#     def forward_hook(module, input, output):
#         activations.append(output)

#     target_layer = model.blocks[-1]
#     handle_f = target_layer.register_forward_hook(forward_hook)
#     handle_b = target_layer.register_full_backward_hook(backward_hook)

#     output = model(input_tensor)
#     pred_class = output.argmax(dim=1).item()
#     model.zero_grad()
#     output[0, pred_class].backward()

#     handle_f.remove()
#     handle_b.remove()

#     grad = gradients[0].squeeze().mean(dim=(1, 2), keepdim=True)
#     cam = (activations[0].squeeze() * grad).sum(dim=0).relu()
#     cam = cam.detach().numpy()
#     cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
#     cam = cv2.resize(cam, (original_image.width, original_image.height))
#     heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
#     orig_np = np.array(original_image.convert("RGB"))[:, :, ::-1]
#     overlay = cv2.addWeighted(orig_np, 0.5, heatmap, 0.5, 0)
#     return overlay


# @app.post("/predict")
# async def predict(image: UploadFile = File(...)):
#     contents = await image.read()
#     pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
#     input_tensor = transform(pil_image).unsqueeze(0)
#     input_tensor.requires_grad_(True)

#     with torch.set_grad_enabled(True):
#         outputs = model(input_tensor)
#         probs = torch.softmax(outputs, dim=1)[0]

#     confidences = [
#         {"label": CLASS_NAMES[i], "confidence": float(probs[i])}
#         for i in range(len(CLASS_NAMES))
#     ]
#     confidences.sort(key=lambda x: x["confidence"], reverse=True)

#     # Grad-CAM
#     try:
#         heatmap_overlay = generate_gradcam(model, input_tensor, pil_image)
#         heatmap_filename = f"heatmap_{uuid.uuid4().hex}.jpg"
#         heatmap_path = f"/tmp/{heatmap_filename}"
#         cv2.imwrite(heatmap_path, heatmap_overlay)
#         heatmap_id = heatmap_filename
#     except Exception as e:
#         print(f"Grad-CAM failed: {e}")
#         heatmap_id = None

#     return JSONResponse({"confidences": confidences, "heatmap_id": heatmap_id})


# @app.get("/heatmap/{filename}")
# async def get_heatmap(filename: str):
#     path = f"/tmp/{filename}"
#     if os.path.exists(path):
#         return FileResponse(path, media_type="image/jpeg")
#     return JSONResponse({"error": "Not found"}, status_code=404)


from fastapi import FastAPI, File, UploadFile
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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Shared Transform ---
transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ]
)

# --- Model 1: Disease Classifier (6 classes) ---
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

# --- Model 2: Scout Model (binary: healthy vs unhealthy) ---
# THE FIX: We must force this to 6 classes because scout_model.pth is actually a 6-class file.
# We pad the remaining 4 slots with "unhealthy_anomaly" so your frontend still catches them!
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
    gradients = []
    activations = []

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
    cam = (activations[0].squeeze() * grad).sum(dim=0).relu()
    cam = cam.detach().numpy()
    cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
    cam = cv2.resize(cam, (original_image.width, original_image.height))
    heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
    orig_np = np.array(original_image.convert("RGB"))[:, :, ::-1]
    overlay = cv2.addWeighted(orig_np, 0.5, heatmap, 0.5, 0)
    return overlay


# --- Endpoint 1: Full Disease Diagnosis ---
@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    contents = await image.read()
    pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
    input_tensor = transform(pil_image).unsqueeze(0)
    input_tensor.requires_grad_(True)

    with torch.set_grad_enabled(True):
        outputs = disease_model(input_tensor)
        probs = torch.softmax(outputs, dim=1)[0]

    confidences = [
        {"label": DISEASE_CLASSES[i], "confidence": float(probs[i])}
        for i in range(len(DISEASE_CLASSES))
    ]
    confidences.sort(key=lambda x: x["confidence"], reverse=True)

    try:
        heatmap_overlay = generate_gradcam(disease_model, input_tensor, pil_image)
        heatmap_filename = f"heatmap_{uuid.uuid4().hex}.jpg"
        heatmap_path = os.path.join(os.path.dirname(__file__), heatmap_filename)
        cv2.imwrite(heatmap_path, heatmap_overlay)
        heatmap_id = heatmap_filename
    except Exception as e:
        print(f"Grad-CAM failed: {e}")
        heatmap_id = None

    return JSONResponse({"confidences": confidences, "heatmap_id": heatmap_id})


# --- Endpoint 2: Scout Binary Check ---
@app.post("/scout")
async def scout(image: UploadFile = File(...)):
    contents = await image.read()
    pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
    input_tensor = transform(pil_image).unsqueeze(0)

    with torch.no_grad():
        outputs = scout_model(input_tensor)
        probs = torch.softmax(outputs, dim=1)[0]

    predicted_index = probs.argmax().item()
    real_label = SCOUT_REAL_CLASSES[predicted_index]
    confidence = float(probs[predicted_index])

    # THE TRANSLATOR: If it's anything other than "healthy", tell the frontend it's "unhealthy"
    if real_label == "healthy":
        final_label = "healthy"
    else:
        final_label = "unhealthy"

    return JSONResponse({"label": final_label, "confidence": confidence})


# --- Heatmap File Server ---
@app.get("/heatmap/{filename}")
async def get_heatmap(filename: str):
    path = os.path.join(os.path.dirname(__file__), filename)
    if os.path.exists(path):
        return FileResponse(path, media_type="image/jpeg")
    return JSONResponse({"error": "Not found"}, status_code=404)
