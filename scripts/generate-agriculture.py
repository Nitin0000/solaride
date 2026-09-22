import argparse
from pathlib import Path

import torch
from diffusers import DPMSolverMultistepScheduler, StableDiffusionPipeline


MODEL = "stable-diffusion-v1-5/stable-diffusion-v1-5"
REVISION = "451f4fe16113bff5a5d2269ed5ad43b0592e9a14"
PROMPT = (
    "Professional landscape photograph of solar powered irrigation on an Indian farm, "
    "blue photovoltaic solar panels mounted on steel legs standing on bare earth beside "
    "lush green crop rows, irrigation water flowing from a metal pipe into a narrow "
    "earthen channel in the foreground, flat agricultural countryside, distant trees, "
    "clear pale blue sky, warm morning sunlight, realistic agriculture, crisp detail, "
    "natural colors, wide angle editorial photography"
)
NEGATIVE_PROMPT = (
    "rooftop, roof, house, building, city, illustration, painting, cartoon, render, "
    "miniature, text, logo, watermark, blurry, distorted, floating panels, people, "
    "oversaturated, oversharpened, fantasy"
)

parser = argparse.ArgumentParser()
parser.add_argument("--seed", type=int, default=3184)
parser.add_argument("--output", type=Path, default=Path("/tmp/solaride-agriculture.png"))
arguments = parser.parse_args()

if not torch.backends.mps.is_available():
    raise RuntimeError("This authoring script requires an Apple Silicon MPS device")

torch.set_num_threads(4)
pipeline = StableDiffusionPipeline.from_pretrained(
    MODEL,
    revision=REVISION,
    torch_dtype=torch.float16,
    variant="fp16",
    use_safetensors=True,
)
pipeline.scheduler = DPMSolverMultistepScheduler.from_config(pipeline.scheduler.config)
pipeline.enable_attention_slicing()
pipeline.enable_vae_slicing()
pipeline.to("mps")

result = pipeline(
    prompt=PROMPT,
    negative_prompt=NEGATIVE_PROMPT,
    width=768,
    height=512,
    num_inference_steps=30,
    guidance_scale=7.0,
    generator=torch.Generator(device="cpu").manual_seed(arguments.seed),
)
if result.nsfw_content_detected and any(result.nsfw_content_detected):
    raise RuntimeError("The model safety checker rejected this output")
arguments.output.parent.mkdir(parents=True, exist_ok=True)
result.images[0].save(arguments.output)
print(f"Saved {arguments.output} with {MODEL}, seed {arguments.seed}")