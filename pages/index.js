import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import withLayout from '../lib/withLayout';
import validate from 'validate.js';
import { withStyles } from '@material-ui/core/styles';
import ResultList from '../components/ResultList';

const styles = theme => ({
  textField: {
    [`& fieldset`]: {
      borderRadius: 0,
    },
    textAlign: 'center',
    paddingTop: '10px',
    paddingBottom: '10px',
  },
  button: {
    borderRadius: 0,
  },
  text: {
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
    },
    textAlign: 'right',
  },
  subtitle: {
    fontWeight: 800,
    color: theme.palette.primary.main,
    marginTop: '5.8rem',
  },
});

const constraints = {
  value: {
    url: {
      message: "'%{value} is not a valid url! Example https://www.zalando.de/",
    },
    presence: {
      allowEmpty: false,
      message: 'field is required!',
    },
  },
};
export const subformValidator = data => validate(data, constraints);

class Index extends Component {
  state = {
    website: { value: 'https://www.zalando.de/', error: '' },
  };

  handleChange = event => {
    const website = {
      value: event.target.value,
      error: '',
    };
    this.setState({
      website,
    });
  };

  submit = () => {
    const { value } = this.state.website;
    const err = subformValidator({ value });
    if (err) {
      const [errMessage, ...rest] = err.value;
      this.setState({
        website: {
          value,
          error: rest.join(',') || errMessage,
        },
      });
    } else {
      // API call
    }

    console.log(err);
  };

  render() {
    const { website } = this.state;
    const { classes } = this.props;
    return (
      <main style={{ margin: '0 auto', maxWidth: 1000, padding: '40px 20px' }}>
        <Head>
          <title>Web Scraper</title>
          <meta name="description" content="This is SEO description of Index page" />
        </Head>
        <Typography
          component="h1"
          variant="h5"
          gutterBottom
          align="center"
          style={{ fontWeight: 800 }}
        >
          Scrape web pages now
        </Typography>
        <div className="search" style={{ paddingTop: 40 }}>
          <Grid container spacing={16} direction="row" justify="center" alignItems="center">
            <Grid item xs={12} sm={4} md={4}>
              <Typography variant="body1" className={classes.text}>
                Let's scrape
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                error={this.state.website.error === '' ? false : true}
                label={this.state.website.error}
                fullWidth
                className={classes.textField}
                name="website"
                value={this.state.website.value}
                InputProps={{
                  inputProps: {
                    className: classes.textField,
                  },
                }}
                variant="outlined"
                onChange={this.handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={2} md={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                align="right"
                className={classes.button}
                onClick={this.submit}
              >
                <span style={{ color: 'white' }}>SCRAPE</span>
              </Button>
            </Grid>
          </Grid>
        </div>
        <div className="result-list">
          <Typography
            component="h2"
            variant="h5"
            gutterBottom
            align="center"
            className={classes.subtitle}
          >
            Top 20 words
          </Typography>
          <ResultList
            results={{ data: [{ word: 'the', frequency: 20 }, { word: 'mu', frequency: 10 }] }}
          />
        </div>
      </main>
    );
  }
}

// Index.getInitialProps = async ({ query }) => ({ user: query.user });

// Index.propTypes = {
//   user: PropTypes.shape({ email: PropTypes.string.isRequired }),
// };

// Index.defaultProps = { user: null };

export default withLayout(withStyles(styles)(Index));
