SINGBOX_TAG ?= v1.13.3
GO_BUILD_TAGS ?=

.PHONY: build clean

build: main.wasm wasm_exec.js singbox.schema.json
	mkdir -p ../public
	cp main.wasm wasm_exec.js singbox.schema.json ../public/

wasm_exec.js:
	cp "$$(go env GOROOT)/lib/wasm/wasm_exec.js" wasm_exec.js

main.wasm: $(wildcard *.go) go.mod go.sum
	GOARCH=wasm GOOS=js go build \
		-trimpath \
		$(if $(strip $(GO_BUILD_TAGS)),-tags "$(GO_BUILD_TAGS)") \
		-ldflags "-s -w -X github.com/sagernet/sing-box/constant.Version=$(SINGBOX_TAG)" \
		-o main.wasm \
		.

singbox.schema.json:
	@printf '%s\n' \
	'{' \
	'  "$schema": "http://json-schema.org/draft-07/schema#",' \
	'  "title": "sing-box configuration",' \
	'  "type": "object",' \
	'  "properties": {' \
	'    "$schema": { "type": "string" },' \
	'    "log": { "type": "object" },' \
	'    "dns": { "type": "object" },' \
	'    "ntp": { "type": "object" },' \
	'    "endpoints": { "type": "array", "items": { "type": "object" } },' \
	'    "inbounds": { "type": "array", "items": { "type": "object" } },' \
	'    "outbounds": { "type": "array", "items": { "type": "object" } },' \
	'    "route": { "type": "object" },' \
	'    "experimental": { "type": "object" }' \
	'  },' \
	'  "additionalProperties": true' \
	'}' > singbox.schema.json

clean:
	rm -f main.wasm wasm_exec.js
