SINGBOX_TAG ?= v1.13.11
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

# Sing-box keeps its own docs (docs/configuration/**) right inside the main
# repo, unlike Xray which has a separate Xray-docs-next repo. So instead of
# curl-ing a doc archive, we just shallow-clone the tagged sing-box repo and
# scrape its docs/configuration tree into a JSON Schema.
assets/sing-box-docs:
	rm -rf assets/sing-box-docs
	mkdir -p assets
	git clone --depth 1 --branch $(SINGBOX_TAG) https://github.com/SagerNet/sing-box assets/sing-box-docs

singbox.schema.json: assets/sing-box-docs scrape-docs.py
	python3 scrape-docs.py assets/sing-box-docs/docs/configuration > singbox.schema.json

clean:
	rm -f main.wasm wasm_exec.js singbox.schema.json
	rm -rf assets
