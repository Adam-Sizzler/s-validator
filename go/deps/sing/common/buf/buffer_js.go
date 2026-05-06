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
