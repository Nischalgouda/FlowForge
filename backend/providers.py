"""LLM provider adapters. Plain REST over httpx: no vendor SDKs to pin."""
import os
from typing import Dict, Optional, Tuple

import httpx

# UI label -> (provider, model id)
MODELS: Dict[str, Tuple[str, str]] = {
    "Gemini 3.5 Flash": ("gemini", "gemini-3.5-flash"),
    "Claude Sonnet 5.5": ("anthropic", "claude-sonnet-5-5"),
    "Claude Haiku 4.5": ("anthropic", "claude-haiku-4-5-20251001"),
}

MAX_OUTPUT_TOKENS = 1024
TIMEOUT = httpx.Timeout(60.0)


class ProviderError(Exception):
    pass


def provider_for(model_label: str) -> str:
    if model_label not in MODELS:
        raise ProviderError(f"Unknown model '{model_label}'")
    return MODELS[model_label][0]


def server_key(provider: str) -> Optional[str]:
    return os.getenv("GEMINI_API_KEY" if provider == "gemini" else "ANTHROPIC_API_KEY")


async def generate(
    model_label: str, prompt: str, system: str, temperature: float, api_key: str
) -> str:
    provider, model = MODELS[model_label]
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        if provider == "gemini":
            return await _gemini(client, model, prompt, system, temperature, api_key)
        return await _anthropic(client, model, prompt, system, temperature, api_key)


async def _gemini(client, model, prompt, system, temperature, api_key) -> str:
    body = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": temperature, "maxOutputTokens": MAX_OUTPUT_TOKENS},
    }
    if system:
        body["systemInstruction"] = {"parts": [{"text": system}]}
    res = await client.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        headers={"x-goog-api-key": api_key},
        json=body,
    )
    _raise_for_status(res)
    try:
        parts = res.json()["candidates"][0]["content"]["parts"]
        return "".join(p.get("text", "") for p in parts)
    except (KeyError, IndexError):
        raise ProviderError("Gemini returned no content (possibly blocked by safety filters)")


async def _anthropic(client, model, prompt, system, temperature, api_key) -> str:
    body = {
        "model": model,
        "max_tokens": MAX_OUTPUT_TOKENS,
        "temperature": temperature,
        "messages": [{"role": "user", "content": prompt}],
    }
    if system:
        body["system"] = system
    res = await client.post(
        "https://api.anthropic.com/v1/messages",
        headers={"x-api-key": api_key, "anthropic-version": "2023-06-01"},
        json=body,
    )
    _raise_for_status(res)
    return "".join(b.get("text", "") for b in res.json().get("content", []))


def _raise_for_status(res: httpx.Response) -> None:
    if res.is_success:
        return
    if res.status_code in (401, 403):
        raise ProviderError("The provider rejected the API key")
    if res.status_code == 429:
        raise ProviderError("Provider rate limit reached, try again shortly")
    if res.status_code == 404:
        raise ProviderError("Model unavailable for this API key")
    if res.status_code == 503:
        raise ProviderError("Provider is overloaded, try again in a moment")
    raise ProviderError(f"Provider error (HTTP {res.status_code})")
