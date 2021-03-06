import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Heading, Paragraph, Text } from 'grommet';
import Play from './Play';

// parseFormat() parses the react-desc property format string into
// an object that makes it easier for us to style the content.
const parseFormat = (format) => {
  const lines = format.split(/\n/);
  const working = [{ values: [] }];
  lines.forEach((line) => {
    if (line.indexOf('{') !== -1) {
      working.unshift({ type: 'object', values: [] });
    } else if (line.indexOf('}') !== -1) {
      while (working[0].type !== 'object') {
        const value = working.shift();
        working[0].values.push(value);
      }
      const value = working.shift();
      working[0].values.push(value);
    } else if (line.indexOf('[') !== -1 && line.indexOf(']') !== -1) {
      working[0].values.push({
        type: 'array',
        values: [line.slice(1, line.length - 1)],
      });
    } else if (line.indexOf('[') !== -1) {
      working.unshift({ type: 'array', values: [] });
    } else if (line.indexOf(']') !== -1) {
      while (working[0].type !== 'array') {
        const value = working.shift();
        working[0].values.push(value);
      }
      const value = working.shift();
      working[0].values.push(value);
    } else if (line.indexOf(':') !== -1 && line.indexOf(',') !== -1) {
      const parts = line.split(':');
      working[0].values.push({
        type: 'property', name: `${parts[0]}:`, values: [parts[1]],
      });
    } else if (line.indexOf(':') !== -1) {
      working.unshift({ type: 'property', name: line, values: [] });
    } else if (line.indexOf(',') !== -1) {
      working[0].values.push(line);
      const value = working.shift();
      working[0].values.push(value);
    } else {
      working[0].values.push(line);
    }
  });
  return working.shift();
};

const Values = ({ name, values }) => {
  let content = (
    <Box direction='row' gap='small' wrap={true}>
      {values
        .filter(v => (!v.type))
        .map((value, index) => <span key={index * 32}>{value}</span>)}
    </Box>
  );
  if (name) {
    content = <Box direction='row' gap='small'>{name}{content}</Box>;
  }
  content = (
    <Box>
      {content}
      {values
        .filter(v => (v.type))
        .map((value, index) => <Value key={index} value={value} />)}
    </Box>
  );
  return content;
};

const Value = ({ value: { name, type, values } }) => {
  let content = <Values name={name} values={values} />;
  if (type === 'object' || type === 'array') {
    content = (
      <Box>
        {type === 'array' ? '[' : '{'}
        <Box pad={{ left: 'medium' }}>
          {content}
        </Box>
        {type === 'array' ? ']' : '}'}
      </Box>
    );
  }
  return content;
};

export default class Doc extends Component {
  state = {}

  componentWillMount() {
    const { onColorChange } = this.context;
    onColorChange('#FFF5CC');
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const {
      children, code, desc, name, example, examples, text,
    } = this.props;
    const { play } = this.state;
    return (
      <Box>
        <Box direction='row-responsive' margin={{ bottom: 'large' }}>
          <Box basis='2/3' align='start'>
            <Heading level={1} margin={{ top: 'none', bottom: 'small' }}>
              <strong>{name}</strong>
            </Heading>
            {desc ? (
              <Paragraph size='large'>
                {desc.description}
              </Paragraph>
            ) : null}
            {text ? (
              <Paragraph size='large'>
                {text}
              </Paragraph>
            ) : null}
            {(desc && desc.availableAt) ? (
              <Button
                href={desc.availableAt.url}
                target='_blank'
                label='Edit on CodeSandbox'
              />
            ) : null}
            {code ? (
              <Button label='Play' onClick={() => this.setState({ play: true })} />
            ) : null}
          </Box>
          <Box flex={true} pad={{ top: 'large', horizontal: 'medium' }}>
            {example}
          </Box>
        </Box>

        {desc ? (
          <Box pad={{ bottom: 'large' }}>
            <Box pad='large' round='large' background='light-1'>
              {desc.properties ?
                desc.properties.map((property, index) => (
                  <Box
                    key={property.name}
                    border='bottom'
                    gap='small'
                    pad={{ top: (index ? 'medium' : undefined), bottom: 'medium' }}
                  >
                    <Heading level={3} margin='none'>
                      <strong>{property.name}</strong>
                    </Heading>
                    <Box
                      direction='row-responsive'
                      justify='between'
                      align='start'
                    >
                      <Box basis='1/3' margin={{ right: 'large' }}>
                        <Paragraph margin='none'>
                          {property.description}
                        </Paragraph>
                      </Box>
                      <Box flex={true} align='start'>
                        <Text color='neutral-3' style={{ maxWidth: '100%' }}>
                          <code>
                            <Value value={parseFormat(property.format)} />
                          </code>
                        </Text>
                      </Box>
                      {examples[property.name] ? (
                        <Box flex={true} align='end'>
                          {examples[property.name] || null}
                        </Box>
                      ) : null}
                    </Box>
                  </Box>
                )) :
                <Text color='light-5'>No properties</Text>
              }
            </Box>
          </Box>
        ) : null}

        {children}
        {play ? <Play code={code} onClose={() => this.setState({ play: false })} /> : null}
      </Box>
    );
  }
}

Doc.propTypes = {
  code: PropTypes.string,
  desc: PropTypes.object,
  example: PropTypes.node,
  examples: PropTypes.object,
  name: PropTypes.string.isRequired,
  text: PropTypes.string,
};

Doc.defaultProps = {
  code: undefined,
  desc: undefined,
  example: null,
  examples: {},
  text: undefined,
};

Doc.contextTypes = {
  onColorChange: PropTypes.func,
};
