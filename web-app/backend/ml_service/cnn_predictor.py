"""
CNN inference for ADNI MRI DICOM volumes.

Architecture matches Main/notebooks/Adni_Zip_Batch_Training_Pipeline.ipynb:
  - torchvision efficientnet_b0 with a 3-class classifier head.
  - Input: 12 central sagittal slices per subject, each resized to 152x152
    and repeated to 3 channels.
  - Per-subject prediction = mean of per-slice softmax probabilities.
"""

from __future__ import annotations

import io
import zipfile
from pathlib import Path
from typing import Optional, Union

import numpy as np
import pydicom
import torch
import torch.nn.functional as F
from torchvision import models, transforms

IMG_SIZE = 152
NUM_SLICES = 12
NUM_CLASSES = 3

_transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
])


def _build_model() -> torch.nn.Module:
    model = models.efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier[1] = torch.nn.Linear(in_features, NUM_CLASSES)
    return model


class CNNPredictor:
    def __init__(self, weights_path: Union[str, Path], device: Optional[str] = None):
        self.device = torch.device(device or ('cuda' if torch.cuda.is_available() else 'cpu'))
        self.model = _build_model()
        state = torch.load(str(weights_path), map_location=self.device, weights_only=False)
        if isinstance(state, dict) and 'state_dict' in state:
            state = state['state_dict']
        self.model.load_state_dict(state)
        self.model.to(self.device).eval()

    @staticmethod
    def _load_volume_from_zip(zip_bytes: bytes) -> np.ndarray:
        """Read every .dcm in the archive, sort by InstanceNumber, return (N, H, W) float32."""
        slices = []
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
            dcm_names = [n for n in zf.namelist() if n.lower().endswith('.dcm')]
            if not dcm_names:
                raise ValueError('Zip archive contains no .dcm files')
            for name in dcm_names:
                with zf.open(name) as f:
                    ds = pydicom.dcmread(io.BytesIO(f.read()), force=True)
                arr = ds.pixel_array.astype(np.float32)
                instance = int(getattr(ds, 'InstanceNumber', 0) or 0)
                slices.append((instance, arr))

        slices.sort(key=lambda x: x[0])
        return np.stack([s[1] for s in slices], axis=0)

    @staticmethod
    def _select_central_slices(volume: np.ndarray, n: int = NUM_SLICES) -> np.ndarray:
        depth = volume.shape[0]
        start = int(depth * 0.40)
        end = int(depth * 0.60)
        if end - start < n:
            start = max(0, depth // 2 - n // 2)
            end = min(depth, start + n)
        indices = np.linspace(start, end - 1, num=n, dtype=int)
        return volume[indices]

    def _slices_to_tensor(self, slices: np.ndarray) -> torch.Tensor:
        tensors = []
        for s in slices:
            s_min, s_max = float(s.min()), float(s.max())
            s_norm = (s - s_min) / (s_max - s_min + 1e-5)
            s_uint8 = (s_norm * 255.0).astype(np.uint8)
            tensors.append(_transform(s_uint8))
        return torch.stack(tensors, dim=0).to(self.device)

    @torch.inference_mode()
    def predict_zip(self, zip_bytes: bytes) -> np.ndarray:
        """Return per-class probabilities (3,) averaged across the selected slices."""
        volume = self._load_volume_from_zip(zip_bytes)
        slices = self._select_central_slices(volume)
        batch = self._slices_to_tensor(slices)
        logits = self.model(batch)
        probs = F.softmax(logits, dim=1).mean(dim=0)
        return probs.detach().cpu().numpy()
