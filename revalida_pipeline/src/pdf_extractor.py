"""
Extração de texto, blocos e imagens de PDFs.
Usa PyMuPDF (fitz) como extrator primário e pdfplumber como secundário.
OCR via pytesseract apenas para páginas escaneadas.
"""
from __future__ import annotations

import hashlib
import io
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF
import pdfplumber
from PIL import Image

from config import settings
from src.logger import log
from src.models import Bbox

# Limiar de texto para considerar página digital (não escaneada)
MIN_CHARS_DIGITAL = 30

# Resolução para renderizar páginas escaneadas
OCR_DPI = 200


@dataclass
class TextBlock:
    text: str
    bbox: Bbox
    page_num: int
    block_no: int = 0
    font_size: float = 0.0
    is_bold: bool = False


@dataclass
class EmbeddedImage:
    data: bytes
    bbox: Optional[Bbox]
    page_num: int
    ext: str = "png"
    width: int = 0
    height: int = 0
    xref: int = 0

    @property
    def hash(self) -> str:
        return hashlib.sha256(self.data).hexdigest()


@dataclass
class PageData:
    page_num: int
    width: float
    height: float
    text_blocks: list[TextBlock] = field(default_factory=list)
    raw_text: str = ""
    images: list[EmbeddedImage] = field(default_factory=list)
    used_ocr: bool = False


@dataclass
class PDFData:
    path: str
    total_pages: int
    is_scanned: bool
    pages: list[PageData] = field(default_factory=list)


# ──────────────────────────────────────────────
# Detecção de página escaneada
# ──────────────────────────────────────────────

def _page_is_scanned(page: fitz.Page) -> bool:
    """Retorna True se a página tem pouco texto e provavelmente é imagem."""
    text = page.get_text("text").strip()
    return len(text) < MIN_CHARS_DIGITAL


# ──────────────────────────────────────────────
# OCR de página
# ──────────────────────────────────────────────

def _ocr_page(page: fitz.Page) -> tuple[str, list[TextBlock]]:
    """Renderiza a página como imagem e aplica OCR."""
    try:
        import pytesseract
        import numpy as np
        import cv2

        if settings.tesseract_cmd and settings.tesseract_cmd != "tesseract":
            pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd

        mat = fitz.Matrix(OCR_DPI / 72, OCR_DPI / 72)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        img_bytes = pix.tobytes("png")

        img = Image.open(io.BytesIO(img_bytes))
        img_np = np.array(img)

        # Pré-processamento para melhorar OCR
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        img_proc = Image.fromarray(thresh)

        # OCR com dados de posição
        data = pytesseract.image_to_data(
            img_proc,
            lang=settings.ocr_lang,
            output_type=pytesseract.Output.DICT,
        )

        full_text_parts = []
        blocks: list[TextBlock] = []
        scale_x = page.rect.width / pix.width
        scale_y = page.rect.height / pix.height

        current_block_no = -1
        current_block_text = []
        current_block_bbox = None

        for i, word in enumerate(data["text"]):
            if not word.strip():
                continue
            conf = int(data["conf"][i])
            if conf < 30:
                continue

            x, y, w, h = data["left"][i], data["top"][i], data["width"][i], data["height"][i]
            block_no = data["block_num"][i]

            # Converte coordenadas de pixel para coordenadas do PDF
            x0 = x * scale_x
            y0 = y * scale_y
            x1 = (x + w) * scale_x
            y1 = (y + h) * scale_y

            full_text_parts.append(word)

            if block_no != current_block_no:
                if current_block_text and current_block_bbox:
                    blocks.append(
                        TextBlock(
                            text=" ".join(current_block_text),
                            bbox=current_block_bbox,
                            page_num=page.number,
                            block_no=current_block_no,
                        )
                    )
                current_block_no = block_no
                current_block_text = [word]
                current_block_bbox = Bbox(x0=x0, y0=y0, x1=x1, y1=y1)
            else:
                current_block_text.append(word)
                current_block_bbox = Bbox(
                    x0=min(current_block_bbox.x0, x0),
                    y0=min(current_block_bbox.y0, y0),
                    x1=max(current_block_bbox.x1, x1),
                    y1=max(current_block_bbox.y1, y1),
                )

        if current_block_text and current_block_bbox:
            blocks.append(
                TextBlock(
                    text=" ".join(current_block_text),
                    bbox=current_block_bbox,
                    page_num=page.number,
                    block_no=current_block_no,
                )
            )

        return " ".join(full_text_parts), blocks

    except ImportError:
        log.warning("pytesseract/opencv não disponível. OCR ignorado.", etapa="ocr")
        return "", []
    except Exception as e:
        log.error(f"Erro no OCR da página {page.number}: {e}", etapa="ocr")
        return "", []


# ──────────────────────────────────────────────
# Extração de texto digital
# ──────────────────────────────────────────────

def _extract_text_blocks_digital(page: fitz.Page) -> tuple[str, list[TextBlock]]:
    """Extrai blocos de texto de página digital com coordenadas."""
    blocks: list[TextBlock] = []
    raw_parts: list[str] = []

    # Usa dict para obter informações de fonte
    page_dict = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)

    for block in page_dict.get("blocks", []):
        if block.get("type") != 0:  # 0 = texto
            continue

        block_text_parts = []
        block_bbox = block.get("bbox", (0, 0, 0, 0))
        max_font_size = 0.0
        is_bold = False

        for line in block.get("lines", []):
            line_parts = []
            for span in line.get("spans", []):
                span_text = span.get("text", "").strip()
                if span_text:
                    line_parts.append(span_text)
                    font_size = span.get("size", 0.0)
                    if font_size > max_font_size:
                        max_font_size = font_size
                    flags = span.get("flags", 0)
                    if flags & 2**4:  # bold flag
                        is_bold = True
            if line_parts:
                block_text_parts.append(" ".join(line_parts))

        block_text = "\n".join(block_text_parts).strip()
        if not block_text:
            continue

        bbox = Bbox(
            x0=block_bbox[0],
            y0=block_bbox[1],
            x1=block_bbox[2],
            y1=block_bbox[3],
        )

        blocks.append(
            TextBlock(
                text=block_text,
                bbox=bbox,
                page_num=page.number,
                block_no=block.get("number", 0),
                font_size=max_font_size,
                is_bold=is_bold,
            )
        )
        raw_parts.append(block_text)

    return "\n".join(raw_parts), blocks


# ──────────────────────────────────────────────
# Extração de imagens embutidas
# ──────────────────────────────────────────────

def _extract_embedded_images(doc: fitz.Document, page: fitz.Page) -> list[EmbeddedImage]:
    """Extrai imagens embutidas na página com suas coordenadas."""
    images: list[EmbeddedImage] = []
    seen_xrefs: set[int] = set()

    for img_info in page.get_images(full=True):
        xref = img_info[0]
        if xref in seen_xrefs:
            continue
        seen_xrefs.add(xref)

        try:
            base_image = doc.extract_image(xref)
            if not base_image:
                continue

            img_bytes = base_image["image"]
            ext = base_image.get("ext", "png")
            width = base_image.get("width", 0)
            height = base_image.get("height", 0)

            # Ignora imagens muito pequenas (logos, ícones)
            if width < 50 or height < 50:
                continue

            # Tenta converter para PNG se necessário
            if ext.lower() not in ("png", "jpeg", "jpg"):
                try:
                    pil_img = Image.open(io.BytesIO(img_bytes))
                    buf = io.BytesIO()
                    pil_img.save(buf, format="PNG")
                    img_bytes = buf.getvalue()
                    ext = "png"
                    width, height = pil_img.size
                except Exception:
                    pass

            # Obtém bbox da imagem na página
            bbox = _get_image_bbox(page, xref)

            images.append(
                EmbeddedImage(
                    data=img_bytes,
                    bbox=bbox,
                    page_num=page.number,
                    ext=ext,
                    width=width,
                    height=height,
                    xref=xref,
                )
            )
        except Exception as e:
            log.debug(f"Erro ao extrair imagem xref={xref}: {e}", etapa="pdf_extract")

    return images


def _get_image_bbox(page: fitz.Page, xref: int) -> Optional[Bbox]:
    """Obtém a bbox de uma imagem na página via seus objetos de renderização."""
    try:
        for item in page.get_drawings():
            pass  # placeholder para futuras melhorias

        # Método via get_image_rects
        rects = page.get_image_rects(xref)
        if rects:
            r = rects[0]
            return Bbox(x0=r.x0, y0=r.y0, x1=r.x1, y1=r.y1)
    except Exception:
        pass
    return None


# ──────────────────────────────────────────────
# Extração principal
# ──────────────────────────────────────────────

def extract_pdf(pdf_path: str | Path) -> PDFData:
    """
    Extrai texto, blocos e imagens de um PDF.
    Detecta automaticamente páginas escaneadas e aplica OCR quando necessário.
    """
    pdf_path = Path(pdf_path)
    log.info(f"Extraindo PDF: {pdf_path.name}", etapa="pdf_extract")

    doc = fitz.open(str(pdf_path))
    total_pages = len(doc)

    pages_data: list[PageData] = []
    scanned_count = 0

    for page_num in range(total_pages):
        page = doc[page_num]
        width = page.rect.width
        height = page.rect.height

        is_scanned = _page_is_scanned(page)
        if is_scanned:
            scanned_count += 1

        if is_scanned:
            raw_text, text_blocks = _ocr_page(page)
            used_ocr = True
            log.debug(f"Página {page_num + 1}: OCR aplicado", etapa="pdf_extract")
        else:
            raw_text, text_blocks = _extract_text_blocks_digital(page)
            used_ocr = False

        images = _extract_embedded_images(doc, page)

        pages_data.append(
            PageData(
                page_num=page_num + 1,  # 1-indexed
                width=width,
                height=height,
                text_blocks=text_blocks,
                raw_text=raw_text,
                images=images,
                used_ocr=used_ocr,
            )
        )

    doc.close()

    is_scanned_doc = scanned_count > (total_pages * 0.5)
    log.info(
        f"PDF extraído: {total_pages} páginas, "
        f"{'escaneado' if is_scanned_doc else 'digital'}, "
        f"{scanned_count} páginas com OCR",
        etapa="pdf_extract",
    )

    return PDFData(
        path=str(pdf_path),
        total_pages=total_pages,
        is_scanned=is_scanned_doc,
        pages=pages_data,
    )


def save_image_to_disk(
    img_data: bytes,
    dest_path: Path,
    max_width: int = 1200,
) -> tuple[int, int]:
    """
    Salva imagem em disco, redimensionando se necessário.
    Retorna (largura, altura) final.
    """
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        pil_img = Image.open(io.BytesIO(img_data))
        # Converte para RGB se necessário
        if pil_img.mode not in ("RGB", "L"):
            pil_img = pil_img.convert("RGB")
        # Redimensiona se muito grande
        if pil_img.width > max_width:
            ratio = max_width / pil_img.width
            new_h = int(pil_img.height * ratio)
            pil_img = pil_img.resize((max_width, new_h), Image.LANCZOS)
        pil_img.save(str(dest_path), format="PNG", optimize=True)
        return pil_img.width, pil_img.height
    except Exception as e:
        log.error(f"Erro ao salvar imagem {dest_path}: {e}", etapa="pdf_extract")
        dest_path.write_bytes(img_data)
        return 0, 0
