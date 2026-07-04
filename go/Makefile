# Single source of truth for versions: the "require" lines in go.mod (the
# same thing Go itself uses to fetch these modules). Nothing duplicated.
SINGBOX_TAG := $(shell awk '/github.com\/sagernet\/sing-box /{print $$2; exit}' go.mod)
SING_TAG    := $(shell awk '/github.com\/sagernet\/sing /{print $$2; exit}' go.mod)

# sing-box has required this build tag since 1.12.0. We only build one
# pinned version (>=1.12), so it's just always on.
GO_BUILD_TAGS ?= singbox_dns_transport_registry

.PHONY: build clean

build: main.wasm wasm_exec.js singbox.schema.json
	mkdir -p ../public
	cp main.wasm wasm_exec.js singbox.schema.json ../public/

wasm_exec.js:
	cp "$$(go env GOROOT)/lib/wasm/wasm_exec.js" wasm_exec.js

# github.com/sagernet/sing's syscall/vectorised-write code assumes a real OS
# and doesn't build under GOOS=js. sing-wasm.patch adds 3 small js-only
# shim files (see the patch itself) that make it build there too. Fetched
# fresh and patched on every build, exactly like Xray's assets/xray-patched.
assets/sing-patched: sing-wasm.patch
	rm -rf assets/sing assets/sing-patched
	mkdir -p assets
	cd assets && \
		git clone https://github.com/sagernet/sing sing && \
		cd sing && \
		git checkout -f $(SING_TAG)
	cat sing-wasm.patch | (cd assets/sing && git apply)
	mv assets/sing assets/sing-patched

main.wasm: assets/sing-patched $(wildcard *.go) go.mod go.sum
	GOARCH=wasm GOOS=js go build \
		-trimpath \
		-tags "$(GO_BUILD_TAGS)" \
		-ldflags "-s -w -X github.com/sagernet/sing-box/constant.Version=$(SINGBOX_TAG)" \
		-o main.wasm \
		.

# sing-box ships its own docs (docs/configuration/**) right inside the repo.
# "go mod download" already fetched the full tagged source as part of the
# main.wasm build above -- we just point at it instead of cloning it again.
singbox.schema.json: scrape-docs.py go.mod go.sum
	go mod download github.com/sagernet/sing-box
	python3 scrape-docs.py "$$(go list -m -f '{{.Dir}}' github.com/sagernet/sing-box)/docs/configuration" > singbox.schema.json

clean:
	rm -f main.wasm wasm_exec.js singbox.schema.json
	rm -rf assets
