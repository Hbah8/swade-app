import '@testing-library/jest-dom'

class ResizeObserverMock {
	observe() {}

	unobserve() {}

	disconnect() {}
}

Object.defineProperty(globalThis, 'ResizeObserver', {
	writable: true,
	value: ResizeObserverMock,
})

if (typeof window !== 'undefined' && window.HTMLElement?.prototype) {
	Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
		writable: true,
		value: () => {},
	})
}
