SINGBOX_TAG ?= v1.13.14
# sing-box has required this since 1.12.0. We only ever build one pinned
# version now (>=1.12), so there's no more need to detect this conditionally
# like the old multi-version build script did — it's just always on.
GO_BUILD_TAGS ?= singbox_dns_transport_registry

.PHONY: build clean update-deps

# Run this ONCE, by hand, whenever you bump SINGBOX_TAG to a version that
# needs a newer github.com/sagernet/sing than what's vendored in ./deps/sing.
# Commit the resulting deps/sing/ changes afterwards.
#
# This reapplies the same 3 JS/WASM compatibility patches that upstream
# sing-box's real (non-js) code can't build without on GOOS=js, previously
# done live on every CI build by build-pages.sh -- now done once, locally.
update-deps:
	go get github.com/sagernet/sing-box@$(SINGBOX_TAG)
	go mod edit -dropreplace github.com/sagernet/sing
	go mod tidy
	$(eval SING_DIR := $(shell go list -m -f '{{.Dir}}' github.com/sagernet/sing))
	rm -rf deps/sing
	rsync -a --delete "$(SING_DIR)/" deps/sing/
	chmod -R u+w deps/sing
	@$(foreach f,vectorised_unix.go copy_direct_posix.go, \
		( head -1 deps/sing/common/bufio/$(f) | grep -q '!js' || sed -i '1s#$$# \&\& !js#' deps/sing/common/bufio/$(f) ); \
		( sed -n 2p deps/sing/common/bufio/$(f) | grep -q '!js' || sed -i '2s#$$#,!js#' deps/sing/common/bufio/$(f) );)
	@( head -1 deps/sing/common/buf/buffer_unix.go | grep -q '!js' || sed -i '1s#$$# \&\& !js#' deps/sing/common/buf/buffer_unix.go )
	@( sed -n 2p deps/sing/common/buf/buffer_unix.go | grep -q '!js' || sed -i '2s#$$#,!js#' deps/sing/common/buf/buffer_unix.go )
	cat > deps/sing/common/bufio/vectorised_js.go << 'EOF'
//go:build js

package bufio

import (
	"os"

	"github.com/sagernet/sing/common/buf"
	M "github.com/sagernet/sing/common/metadata"
)

type syscallVectorisedWriterFields struct{}

func (w *SyscallVectorisedWriter) WriteVectorised(buffers []*buf.Buffer) error {
	defer buf.ReleaseMulti(buffers)
	return os.ErrInvalid
}

func (w *SyscallVectorisedPacketWriter) WriteVectorisedPacket(buffers []*buf.Buffer, destination M.Socksaddr) error {
	defer buf.ReleaseMulti(buffers)
	_ = destination
	return os.ErrInvalid
}
EOF
	cat > deps/sing/common/buf/buffer_js.go << 'EOF'
//go:build js

package buf

type iovec struct {
	Base *byte
	Len  uint64
}

func (v *iovec) SetLen(length int) {
	v.Len = uint64(length)
}

func (b *Buffer) Iovec(length int) iovec {
	var v iovec
	v.Base = &b.data[b.start]
	v.SetLen(length)
	return v
}
EOF
	cat > deps/sing/common/bufio/copy_direct_js.go << 'EOF'
//go:build js

package bufio

import (
	"os"

	"github.com/sagernet/sing/common/buf"
	M "github.com/sagernet/sing/common/metadata"
	N "github.com/sagernet/sing/common/network"
)

type syscallReadWaiter struct{}

func createSyscallReadWaiter(reader any) (*syscallReadWaiter, bool) {
	_ = reader
	return nil, false
}

func (w *syscallReadWaiter) InitializeReadWaiter(options N.ReadWaitOptions) (needCopy bool) {
	_ = options
	return false
}

func (w *syscallReadWaiter) WaitReadBuffer() (buffer *buf.Buffer, err error) {
	return nil, os.ErrInvalid
}

type vectorisedSyscallReadWaiter struct{}

func createVectorisedSyscallReadWaiter(reader any) (*vectorisedSyscallReadWaiter, bool) {
	_ = reader
	return nil, false
}

func (w *vectorisedSyscallReadWaiter) InitializeReadWaiter(options N.ReadWaitOptions) (needCopy bool) {
	_ = options
	return false
}

func (w *vectorisedSyscallReadWaiter) WaitReadBuffers() (buffers []*buf.Buffer, err error) {
	return nil, os.ErrInvalid
}

type syscallPacketReadWaiter struct{}

func createSyscallPacketReadWaiter(reader any) (*syscallPacketReadWaiter, bool) {
	_ = reader
	return nil, false
}

func (w *syscallPacketReadWaiter) InitializeReadWaiter(options N.ReadWaitOptions) (needCopy bool) {
	_ = options
	return false
}

func (w *syscallPacketReadWaiter) WaitReadPacket() (buffer *buf.Buffer, destination M.Socksaddr, err error) {
	return nil, M.Socksaddr{}, os.ErrInvalid
}
EOF
	go mod edit -replace github.com/sagernet/sing=./deps/sing
	go mod tidy

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
