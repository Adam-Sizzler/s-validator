"""
Scrapes sing-box's own docs/configuration/ tree (mkdocs-material format) into a
single JSON Schema used by Monaco for autocomplete/hover/validation.

Unlike Xray-docs-next, sing-box docs don't use a special ">`field`: type"
convention -- they're plain mkdocs pages with "#### field_name" headers and
free-form markdown underneath. So instead of inferring JSON types from the
text, we just extract (name, markdownDescription, required) per field and
keep the schema permissive (additionalProperties: true) on those objects.
Hard validation of actual values is left to the sing-box core itself (via
wasm) -- this schema's job is autocomplete + hover docs + catching typos in
enum-like fields such as "type".

Usage:
    python3 scrape-docs.py <path-to-sing-box-repo>/docs/configuration > singbox.schema.json
"""

import json
import os
import re
import sys
from urllib.parse import urljoin

SITE_URL = "https://sing-box.sagernet.org/"

TABLE_ROW_RE = re.compile(
    r"^\|\s*`([\w.-]+)`\s*\|\s*\[[^\]]+\]\(([^)]+)\)"
)
TABLE_ROW_DEFAULT_RE = re.compile(
    r"^\|\s*empty \(default\)\s*\|\s*\[[^\]]+\]\(([^)]+)\)"
)
FIELD_HEADER_RE = re.compile(r"^####\s+(.+)$")
ADMONITION_RE = re.compile(r"^!!!\s")


def clean_markdown(text: str, base_url: str) -> str:
    lines = text.splitlines()
    out = []
    skipping_admonition = False
    for line in lines:
        if ADMONITION_RE.match(line):
            skipping_admonition = True
            continue
        if skipping_admonition:
            if line.strip() == "" or line.startswith("    ") or line.startswith("\t"):
                continue
            skipping_admonition = False
        out.append(line)

    text = "\n".join(out)
    text = text.replace("==Required==", "")

    def resolve_link(m: re.Match) -> str:
        label, url = m.group(1), m.group(2)
        if url.startswith("http"):
            return f"[{label}]({url})"
        return f"[{label}]({urljoin(base_url, url)})"

    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", resolve_link, text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


def parse_fields(text: str, base_url: str) -> dict:
    """Parses every '#### field_name' block until the next '##'/'###' heading."""
    properties = {}
    required = []
    blocks = re.split(r"(?m)^####\s+", text)[1:]
    for block in blocks:
        name_line, _, rest = block.partition("\n")
        name = name_line.strip().strip("`")
        # stop this field's body at the next '##'/'###' section heading
        rest = re.split(r"(?m)^##", rest)[0]
        is_required = "==Required==" in rest
        desc = clean_markdown(rest, base_url) or f"See `{name}`."
        properties[name] = {
            "description": desc,
            "markdownDescription": desc,
        }
        if is_required:
            required.append(name)
    return properties, required


def parse_type_table(text: str) -> list[tuple[str, str]]:
    """Extracts (type_name, relative_file) pairs from an index.md '| `type` | [Name](./file/) |' table."""
    results = []
    for line in text.splitlines():
        m = TABLE_ROW_RE.match(line)
        if m:
            results.append((m.group(1), m.group(2)))
            continue
        m = TABLE_ROW_DEFAULT_RE.match(line)
        if m:
            results.append(("legacy", m.group(1)))
    return results


def load(path: str) -> str:
    with open(path, encoding="utf-8") as f:
        return f.read()


def build_discriminated_array(
    config_dir: str, category: str, extra_shared: list[str]
) -> dict:
    """Builds a schema for arrays like inbounds/outbounds/endpoints/dns servers,
    where a 'type' field selects the protocol. Each type gets its own
    'if type==X then these-exact-fields, nothing else' branch (additionalProperties:
    false), same as Xray's per-object $refs -- so a typo'd field name (e.g.
    "sniff1ing") gets flagged, not just a typo'd type value."""
    index_path = os.path.join(config_dir, category, "index.md")
    index_text = load(index_path)
    base_url = urljoin(SITE_URL, f"configuration/{category}/")
    types = parse_type_table(index_text)

    common_properties, _ = parse_fields(index_text, base_url)
    common_properties.setdefault(
        "tag",
        {
            "type": "string",
            "description": "Tag for referencing this entry elsewhere in the config.",
            "markdownDescription": "Tag for referencing this entry elsewhere in the config.",
        },
    )

    enum_values = []
    enum_descriptions = []
    md_enum_descriptions = []
    variants = []

    for type_name, rel_file in types:
        file_path = os.path.normpath(os.path.join(config_dir, category, rel_file, "index.md"))
        if not os.path.isfile(file_path):
            file_path = os.path.normpath(os.path.join(config_dir, category, rel_file.rstrip("/") + ".md"))

        enum_values.append(type_name)

        if not os.path.isfile(file_path):
            enum_descriptions.append(type_name)
            md_enum_descriptions.append(f"`{type_name}`")
            continue

        text = load(file_path)
        page_url = urljoin(base_url, rel_file)
        summary = f"See [{type_name}]({page_url}) configuration."
        enum_descriptions.append(summary)
        md_enum_descriptions.append(summary)

        variant_properties = dict(common_properties)
        for shared_name in extra_shared:
            if shared_name.lower().replace(" ", "-") in text.lower().replace(" ", "-") or shared_name in text:
                variant_properties.update(SHARED_FIELDS.get(shared_name, {}))

        props, _ = parse_fields(text, page_url)
        variant_properties.update(props)
        variant_properties["type"] = {"const": type_name}

        variants.append(
            {
                "if": {"properties": {"type": {"const": type_name}}}, 
                "then": {
                    "properties": variant_properties,
                    "additionalProperties": False,
                },
            }
        )

    type_schema = {
        "type": "object",
        "properties": {
            "type": {
                "type": "string",
                "description": f"Type of the {category[:-1] if category.endswith('s') else category}.",
                "markdownDescription": f"Type of the {category}. See [{category}]({base_url}).",
                "enum": enum_values,
                "enumDescriptions": enum_descriptions,
                "markdownEnumDescriptions": md_enum_descriptions,
            }
        },
        # Permissive at the top level (a typo'd/unknown type is already caught
        # by the enum above); once "type" matches a known value, the matching
        # "if/then" branch below takes over with additionalProperties: false,
        # so a typo'd *field name* for that type gets flagged too.
        "additionalProperties": True,
        "required": ["type"],
        "allOf": variants,
    }
    return type_schema


def build_plain_object(config_dir: str, rel_path: str) -> dict:
    """Builds a schema for a single, non-discriminated config object such as
    log/ntp/dns/route/experimental, from its index.md."""
    index_path = os.path.join(config_dir, rel_path, "index.md")
    text = load(index_path)
    base_url = urljoin(SITE_URL, f"configuration/{rel_path}/")
    props, required = parse_fields(text, base_url)
    schema = {
        "type": "object",
        "properties": props,
        "additionalProperties": True,
    }
    if required:
        schema["required"] = required
    return schema


SHARED_FIELDS: dict[str, dict] = {}


def load_shared(config_dir: str, name: str, filename: str) -> dict:
    path = os.path.join(config_dir, "shared", filename)
    if not os.path.isfile(path):
        return {}
    text = load(path)
    base_url = urljoin(SITE_URL, "configuration/shared/")
    props, _ = parse_fields(text, base_url)
    return props


def main() -> None:
    config_dir = sys.argv[1]

    SHARED_FIELDS["Listen Fields"] = load_shared(config_dir, "Listen Fields", "listen.md")
    SHARED_FIELDS["Dial Fields"] = load_shared(config_dir, "Dial Fields", "dial.md")

    inbounds = build_discriminated_array(config_dir, "inbound", ["Listen Fields"])
    outbounds = build_discriminated_array(config_dir, "outbound", ["Dial Fields"])
    endpoints = build_discriminated_array(config_dir, "endpoint", ["Dial Fields", "Listen Fields"])
    dns_servers = build_discriminated_array(config_dir, os.path.join("dns", "server"), [])

    dns = build_plain_object(config_dir, "dns")
    dns["properties"]["servers"] = {
        "type": "array",
        "description": "List of DNS servers.",
        "markdownDescription": "List of [DNS servers](https://sing-box.sagernet.org/configuration/dns/server/).",
        "items": dns_servers,
    }

    route = build_plain_object(config_dir, "route")
    log = build_plain_object(config_dir, "log")
    ntp = build_plain_object(config_dir, "ntp")
    for k, v in SHARED_FIELDS["Dial Fields"].items():
        ntp["properties"].setdefault(k, v)

    experimental = build_plain_object(config_dir, "experimental")
    for name, subdir in (
        ("cache_file", "cache-file"),
        ("clash_api", "clash-api"),
        ("v2ray_api", "v2ray-api"),
    ):
        sub_path = os.path.join(config_dir, "experimental", f"{subdir}.md")
        if os.path.isfile(sub_path):
            base_url = urljoin(SITE_URL, f"configuration/experimental/{subdir}/")
            props, required = parse_fields(load(sub_path), base_url)
            sub_schema = {"type": "object", "properties": props, "additionalProperties": True}
            if required:
                sub_schema["required"] = required
            experimental["properties"][name] = sub_schema

    schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "sing-box configuration",
        "type": "object",
        "properties": {
            "$schema": {"type": "string"},
            "log": log,
            "dns": dns,
            "ntp": ntp,
            "endpoints": {"type": "array", "items": endpoints},
            "inbounds": {"type": "array", "items": inbounds},
            "outbounds": {"type": "array", "items": outbounds},
            "route": route,
            "experimental": experimental,
        },
        "additionalProperties": True,
    }

    print(json.dumps(schema, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
