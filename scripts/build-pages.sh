#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

VERSIONS_FILE="${VERSIONS_FILE:-versions.json}"
SITE_DIR="${SITE_DIR:-site}"
GO_DIR="${ROOT_DIR}/go"
GO_MOD_BACKUP="$(mktemp)"
GO_SUM_BACKUP="$(mktemp)"
cp "${GO_DIR}/go.mod" "${GO_MOD_BACKUP}"
cp "${GO_DIR}/go.sum" "${GO_SUM_BACKUP}"

cleanup() {
  cp "${GO_MOD_BACKUP}" "${GO_DIR}/go.mod"
  cp "${GO_SUM_BACKUP}" "${GO_DIR}/go.sum"
  rm -f "${GO_MOD_BACKUP}" "${GO_SUM_BACKUP}"
  rm -rf "${GO_DIR}/.patched-sing"
}
trap cleanup EXIT

if [[ ! -f "${VERSIONS_FILE}" ]]; then
  echo "versions file not found: ${VERSIONS_FILE}" >&2
  exit 1
fi

mapfile -t PINNED_VERSIONS < <(
  node --input-type=module -e '
    import fs from "node:fs";
    const file = process.argv[1];
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const versions = data.pinnedVersions ?? [];
    for (const version of versions) {
      console.log(String(version));
    }
  ' "${VERSIONS_FILE}"
)

INCLUDE_LATEST="$(
  node --input-type=module -e '
    import fs from "node:fs";
    const file = process.argv[1];
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    process.stdout.write((data.includeLatest ?? true) ? "true" : "false");
  ' "${VERSIONS_FILE}"
)"

if [[ "${#PINNED_VERSIONS[@]}" -eq 0 && "${INCLUDE_LATEST}" != "true" ]]; then
  echo "nothing to build: no pinned versions and includeLatest=false" >&2
  exit 1
fi

GITHUB_REPOSITORY_VALUE="${GITHUB_REPOSITORY:-}"
REPOSITORY_NAME="${GITHUB_REPOSITORY_VALUE##*/}"
if [[ "${GITHUB_ACTIONS:-}" == "true" && -n "${REPOSITORY_NAME}" && "${REPOSITORY_NAME}" != *.github.io ]]; then
  BASE_PREFIX="/${REPOSITORY_NAME}"
else
  BASE_PREFIX=""
fi

base_path_for() {
  local subpath="$1"
  if [[ -n "${BASE_PREFIX}" ]]; then
    if [[ -n "${subpath}" ]]; then
      echo "${BASE_PREFIX}/${subpath}/"
    else
      echo "${BASE_PREFIX}/"
    fi
  else
    if [[ -n "${subpath}" ]]; then
      echo "/${subpath}/"
    else
      echo "/"
    fi
  fi
}

short_version() {
  local tag="$1"
  echo "${tag#v}"
}

build_go_artifacts() {
  local singbox_tag="$1"
  (
    patch_file_build_tag_for_js() {
      local go_file="$1"
      if [[ ! -f "${go_file}" ]]; then
        return
      fi

      local first_line
      local second_line
      first_line="$(sed -n '1p' "${go_file}")"
      second_line="$(sed -n '2p' "${go_file}")"

      if [[ "${first_line}" == "//go:build "* && "${first_line}" != *"!js"* ]]; then
        sed -i '1s#$# \&\& !js#' "${go_file}"
      fi
      if [[ "${second_line}" == "// +build "* && "${second_line}" != *"!js"* ]]; then
        sed -i '2s#$#,!js#' "${go_file}"
      fi
    }

    cd go
    go mod edit -dropreplace github.com/sagernet/sing || true
    go get github.com/sagernet/sing-box@"${singbox_tag}"
    go mod tidy

    local sing_module_dir
    sing_module_dir="$(go list -m -f '{{.Dir}}' github.com/sagernet/sing)"

    rm -rf ./.patched-sing
    rsync -a --delete "${sing_module_dir}/" "./.patched-sing/"
    chmod -R u+w ./.patched-sing
    patch_file_build_tag_for_js ./.patched-sing/common/bufio/vectorised_unix.go
    patch_file_build_tag_for_js ./.patched-sing/common/bufio/copy_direct_posix.go
    patch_file_build_tag_for_js ./.patched-sing/common/buf/buffer_unix.go

    cat > ./.patched-sing/common/bufio/vectorised_js.go <<'EOF'
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

    cat > ./.patched-sing/common/buf/buffer_js.go <<'EOF'
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

    cat > ./.patched-sing/common/bufio/copy_direct_js.go <<'EOF'
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

    go mod edit -replace github.com/sagernet/sing=./.patched-sing
    go mod tidy
    SINGBOX_TAG="${singbox_tag}" make build
  )
}

build_frontend() {
  local base_path="$1"
  local output_dir="$2"
  local preserve_versions_dir="${3:-false}"
  VITE_BASE_PATH="${base_path}" npm run build
  mkdir -p "${output_dir}"
  if [[ "${preserve_versions_dir}" == "true" ]]; then
    rsync -a --delete --exclude 'v/' --exclude 'versions.json' dist/ "${output_dir}/"
  else
    rsync -a --delete dist/ "${output_dir}/"
  fi
}

rm -rf "${SITE_DIR}"
mkdir -p "${SITE_DIR}/v"

for version in "${PINNED_VERSIONS[@]}"; do
  pinned_tag="v${version#v}"
  pinned_short="$(short_version "${pinned_tag}")"
  pinned_subpath="v/${pinned_short}"
  pinned_base_path="$(base_path_for "${pinned_subpath}")"
  pinned_output="${SITE_DIR}/${pinned_subpath}"

  echo "Building pinned version ${pinned_tag} -> ${pinned_subpath}"
  build_go_artifacts "${pinned_tag}"
  build_frontend "${pinned_base_path}" "${pinned_output}"
done

if [[ "${INCLUDE_LATEST}" == "true" ]]; then
  latest_tag="$(
    cd go
    go list -m -f '{{.Version}}' github.com/sagernet/sing-box@latest
  )"
  latest_short="$(short_version "${latest_tag}")"

  echo "Building latest version ${latest_tag} -> / and v/latest"
  build_go_artifacts "${latest_tag}"
  build_frontend "$(base_path_for "")" "${SITE_DIR}" true
  build_frontend "$(base_path_for "v/latest")" "${SITE_DIR}/v/latest"

  node --input-type=module -e '
    import fs from "node:fs";
    const target = process.argv[1];
    const payload = {
      latest: process.argv[2],
      versions: process.argv.slice(3)
    };
    fs.writeFileSync(target, JSON.stringify(payload, null, 2) + "\n");
  ' "${SITE_DIR}/versions.json" "${latest_short}" "${PINNED_VERSIONS[@]}"
fi

echo "Built Pages artifact in ${SITE_DIR}"
