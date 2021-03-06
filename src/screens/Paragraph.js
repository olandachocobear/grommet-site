import React from 'react';

import { Box, Paragraph } from 'grommet';
import doc from 'grommet/components/Paragraph/doc';

import Page from '../components/Page';
import Doc from '../components/Doc';

const desc = doc(Paragraph).toJSON();

export default () => (
  <Page>
    <Doc
      name='Paragraph'
      desc={desc}
      examples={{
        size: (
          <Box direction='row' justify='end' wrap={true}>
            {['small', 'medium', 'large', 'xlarge'].map(size => (
              <Box key={size} margin='xsmall'>
                <Paragraph size={size} margin='none'>
                  Lorem ipsum ...
                </Paragraph>
              </Box>
            ))}
          </Box>
        ),
      }}
    />
  </Page>
);
