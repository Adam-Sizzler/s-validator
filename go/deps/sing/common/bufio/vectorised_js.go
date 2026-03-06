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
