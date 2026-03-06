SINGBOX_TAG ?= v1.11.13

.PHONY: build clean

build: main.wasm wasm_exec.js singbox.schema.json
	mkdir -p ../public
	cp main.wasm wasm_exec.js singbox.schema.json ../public/

wasm_exec.js:
	cp "$$(go env GOROOT)/lib/wasm/wasm_exec.js" wasm_exec.js

main.wasm: main.go go.mod go.sum
	GOARCH=wasm GOOS=js go build \
		-trimpath \
		-ldflags "-s -w -X github.com/sagernet/sing-box/constant.Version=$(SINGBOX_TAG)" \
		-o main.wasm \
		main.go

clean:
	rm -f main.wasm wasm_exec.js
