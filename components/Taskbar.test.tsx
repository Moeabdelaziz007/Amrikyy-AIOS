import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Taskbar from './Taskbar';

describe('Taskbar', () => {
  it('renders nothing as it is a legacy component', () => {
    const { container } = render(
      <Taskbar
        openWindows={[]}
        onOpen={vi.fn()}
        onRestore={vi.fn()}
        onFocus={vi.fn()}
        activeWindowId={null}
      />
    );
    // The component is designed to return null, so its container should be empty.
    expect(container.firstChild).toBeNull();
  });
});
