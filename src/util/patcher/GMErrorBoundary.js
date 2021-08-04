export default () => {
const { React } = goosemod.webpackModules.common;

const Header = goosemod.webpackModules.findByDisplayName('Header');
const Button = goosemod.webpackModules.findByProps('Sizes', 'Colors', 'Looks', 'DropdownSizes');

const Markdown = goosemod.webpackModules.findByDisplayName('Markdown');

return class GMErrorBoundary extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      error: false
    };
  }

  componentDidCatch(error, moreInfo) {
    console.log('honk', {error, moreInfo});

    const errorStack = decodeURI(error.stack.split('\n').filter((x) => !x.includes('/assets/')).join('\n'));
    const componentStack = decodeURI(moreInfo.componentStack.split('\n').slice(1, 9).join('\n'));

    const suspectedCause = errorStack.match(/\((.*) \| GM Module:/)?.[1] || componentStack.match(/\((.*) \| GM Module:/)?.[1] || 'Unknown';

    this.setState({
      error: true,

      suspectedCause,

      errorStack: {
        raw: error.stack,
        useful: errorStack
      },

      componentStack: {
        raw: moreInfo.componentStack,
        useful: componentStack
      }
    });
  }

  render() {
    if (this.state.toRetry) {
      this.state.error = false;
    }

    setTimeout(() => {
      this.state.toRetry = true;
    }, 100);

    return this.state.error ? React.createElement('div', {
      className: 'gm-error-boundary'
    },
      React.createElement('div', {},
        React.createElement('div', {}),
  
        React.createElement(Header, {
          size: Header.Sizes.SIZE_24,
        },  'GooseMod has handled an error',
          React.createElement(Markdown, {}, '## Suspected Cause: ' + this.state.suspectedCause)
        )
      ),
  
      React.createElement('div', {},
        React.createElement(Button, {
          color: Button.Colors.LINK,
          size: Button.Sizes.LARGE,
  
          onClick: () => {
            this.state.toRetry = false;

            this.state.showDetails = !this.state.showDetails;
            this.forceUpdate();
          }
        }, this.state.showDetails ? 'Hide Details' : 'Show Details'),

        React.createElement(Button, {
          color: Button.Colors.RED,
          size: Button.Sizes.LARGE,
  
          onClick: () => {
            location.reload();
          }
        }, 'Refresh')
      ),

      this.state.showDetails ? React.createElement('div', {},
        React.createElement(Markdown, {}, `# Error Stack`),
        React.createElement(Markdown, {}, `\`\`\`
${this.state.errorStack.useful}
\`\`\``),
        React.createElement(Markdown, {}, `# Component Stack`),
        React.createElement(Markdown, {}, `\`\`\`
${this.state.componentStack.useful}
\`\`\``)
      ) : null
    ) : this.props.children;
  }
}
};