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
