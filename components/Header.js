import React from 'react';
import Link from 'next/link';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';

import { styleToolbar } from './SharedStyles';

const Header = () => {
  return (
    <header>
      <Toolbar style={styleToolbar}>
        <Grid container direction="row" justify="flex-start" alignItems="center">
          <Grid item sm={10} xs={9} style={{ textAlign: 'left' }}>
            <Link prefetch href="/">
              <svg
                width="42px"
                height="19px"
                viewBox="0 0 42 19"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
              >
                <title>za.</title>
                <defs />
                <g
                  id="Page-1"
                  stroke="none"
                  strokeWidth="1"
                  fill="none"
                  fillRule="evenodd"
                  fillOpacity="0.981317935"
                  fontFamily="ProximaNova-Semibold, Proxima Nova"
                  fontSize="36"
                  fontWeight="500"
                >
                  <g id="Desktop" transform="translate(-62.000000, -29.000000)">
                    <g id="HEADER">
                      <text id="za.">
                        <tspan x="61" y="47" fill="#000000">
                          za
                        </tspan>
                        <tspan x="97.4042969" y="47" fill="#FF6C00">
                          .
                        </tspan>
                      </text>
                    </g>
                  </g>
                </g>
              </svg>
            </Link>
          </Grid>
        </Grid>
      </Toolbar>
    </header>
  );
};

export default Header;
