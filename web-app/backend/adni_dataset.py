import os
from dataclasses import dataclass
from functools import lru_cache
from typing import Optional

import pandas as pd


def _normalize_viscode(value) -> str:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    s = str(value).strip().lower()
    s = "".join(s.split())
    return s


def _read_csv(path: str) -> pd.DataFrame:
    if not os.path.exists(path):
        raise FileNotFoundError(path)
    return pd.read_csv(path, low_memory=False)


def _ensure_viscode_join(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    vis = df["VISCODE"] if "VISCODE" in df.columns else None
    vis2 = df["VISCODE2"] if "VISCODE2" in df.columns else None

    if vis is not None:
        vis = vis.map(_normalize_viscode)
    if vis2 is not None:
        vis2 = vis2.map(_normalize_viscode)

    if vis is not None and vis2 is not None:
        df["VISCODE_JOIN"] = vis.where(vis != "", vis2)
    elif vis is not None:
        df["VISCODE_JOIN"] = vis
    elif vis2 is not None:
        df["VISCODE_JOIN"] = vis2
    else:
        df["VISCODE_JOIN"] = ""

    return df


@dataclass(frozen=True)
class ADNIDataPaths:
    data_dir: str
    adnimerge: str = "ADNIMERGE_10Nov2025.csv"
    dementia_rating: str = "Dementia_Rating.csv"
    diagnostic_summary: str = "Diagnositic_Summary.csv"
    cognitive_scores: str = "Cognitive_Scores.csv"
    ptdemog: str = "PTDEMOG_10Nov2025.csv"
    apoe: str = "ApoE_Genotyping.csv"


class ADNIDataStore:
    def __init__(self, paths: ADNIDataPaths):
        self.paths = paths
        self._merged: Optional[pd.DataFrame] = None

    def load(self) -> pd.DataFrame:
        if self._merged is not None:
            return self._merged

        base = self.paths.data_dir

        adni = _ensure_viscode_join(_read_csv(os.path.join(base, self.paths.adnimerge)))
        cdr = _ensure_viscode_join(_read_csv(os.path.join(base, self.paths.dementia_rating)))
        diag = _ensure_viscode_join(_read_csv(os.path.join(base, self.paths.diagnostic_summary)))
        cog = _ensure_viscode_join(_read_csv(os.path.join(base, self.paths.cognitive_scores)))
        ptd = _ensure_viscode_join(_read_csv(os.path.join(base, self.paths.ptdemog)))
        apoe = _ensure_viscode_join(_read_csv(os.path.join(base, self.paths.apoe)))

        # Anchor on ADNIMERGE, join others on RID + VISCODE_JOIN.
        merged = adni
        for right in [cdr, diag, cog, ptd, apoe]:
            # Not all tables are guaranteed to have the join keys in clean form.
            if "RID" in right.columns and "VISCODE_JOIN" in right.columns:
                merged = merged.merge(
                    right,
                    how="left",
                    on=["RID", "VISCODE_JOIN"],
                    suffixes=("", "_r"),
                )

        # Provide VISCODE_ptd (training feature name family) as a copy of VISCODE_JOIN.
        # The phase-3 model has many one-hot columns like VISCODE_ptd_bl, VISCODE_ptd_m12, etc.
        if "VISCODE_ptd" not in merged.columns:
            merged["VISCODE_ptd"] = merged.get("VISCODE_JOIN", "")

        self._merged = merged
        return merged

    def get_row(self, rid: int, viscode: str) -> pd.Series:
        df = self.load()
        v = _normalize_viscode(viscode)
        if "RID" not in df.columns or "VISCODE_JOIN" not in df.columns:
            raise ValueError("Merged dataset is missing RID/VISCODE_JOIN")

        matches = df[(df["RID"] == int(rid)) & (df["VISCODE_JOIN"] == v)]
        if matches.empty:
            raise KeyError(f"No row found for RID={rid} VISCODE={viscode}")

        return matches.iloc[0]


@lru_cache(maxsize=4)
def get_store(data_dir: str) -> ADNIDataStore:
    return ADNIDataStore(ADNIDataPaths(data_dir=data_dir))
