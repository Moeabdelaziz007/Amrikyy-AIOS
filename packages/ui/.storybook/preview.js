import '../src/styles/tailwind.css';
import React from 'react';
import { KomabiThemeProvider } from '../src/theme/useTheme';

function SBErrorBoundary({ children }) {
  class Boundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
      return { error };
    }

    componentDidCatch(error, info) {
      // Log to console so the terminal / debug log captures it
      // eslint-disable-next-line no-console
      console.error('Storybook rendering error:', error, info);
    }

    render() {
      if (this.state.error) {
        return React.createElement(
          'div',
          { style: { padding: 20, color: 'white', background: '#b91c1c' } },
          'Story rendering error: ',
          String(this.state.error)
        );
      }
      return this.props.children;
    }
  }

  return React.createElement(Boundary, null, children);
}

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: { expanded: true },
  layout: 'centered',
};

export const decorators = [
  (Story) =>
    React.createElement(
      KomabiThemeProvider,
      null,
      React.createElement(
        'div',
        { className: 'bg-background text-foreground p-4' },
        React.createElement(SBErrorBoundary, null, React.createElement(Story))
      )
    ),
];

export default {
  parameters,
  decorators,
};
