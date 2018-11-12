import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import axios from 'axios';
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
    [theme.breakpoints.down('xs')]: {
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
  url: {
    url: {
      message: "'%{value}' is not valid! Example https://www.zalando.de/",
    },
    presence: {
      allowEmpty: false,
      message: 'field is required!',
    },
  },
};
export const subformValidator = data => validate(data, constraints);

const API = `http://localhost:8000/api/scrape`;

const mockResults = { data: [{ word: 'the', frequency: 20 }, { word: 'mu', frequency: 10 }] };

class Index extends Component {
  state = {
    website: { url: 'https://www.zalando.com/', error: '' },
    results: null,
    error: null,
  };

  handleChange = event => {
    const website = {
      url: event.target.value,
      error: '',
    };
    this.setState({
      website,
    });
  };

  validInput = url => {
    const validationErr = subformValidator({ url });
    if (validationErr) {
      const [errMessage, ...rest] = validationErr.url;
      this.setState({
        website: {
          url,
          error: rest.join(',') || errMessage,
        },
      });
      return false;
    } else {
      return true;
    }
  };

  setError = error => {
    if (error.response) {
      console.log('server error', error.response.status);
      this.setState({
        error: {
          statusCode: error.response.status,
          isServerError: true,
        },
      });
    } else if (error.request) {
      console.log('client error', error);
      this.setState({
        error: {
          statusCode: error.request.status,
          isServerError: false,
        },
      });
    } else {
      console.log('error while posting url', error);
      this.setState({ error });
    }
  };

  submit = async () => {
    const { url } = this.state.website;
    if (!this.validInput(url)) {
      return;
    }
    // API call
    try {
      const results = await axios.post(`${API}?resultSize=${this.props.resultSize}`, { url });
      this.setState({ results });
    } catch (error) {
      // logic for deciding if client or server side error
      this.setError(error);
    }
  };

  render() {
    const { website, results, error } = this.state;
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
          Scrape websites now
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
                error={website.error === '' ? false : true}
                label={website.error}
                fullWidth
                className={classes.textField}
                name="website"
                value={website.url}
                InputProps={{
                  inputProps: {
                    className: classes.textField,
                    placeholder: 'i.e. https://zalando.com/',
                  },
                }}
                variant="outlined"
                onChange={this.handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={2} md={2}>
              <Button
                data-testid="submit"
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

        {results && (
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
            <ResultList results={results} />
          </div>
        )}
        {error && (
          <div className="error-page" data-testid="error-page">
            <Typography
              component="h2"
              variant="h5"
              gutterBottom
              align="center"
              className={classes.subtitle}
            >
              Oh something went wrong :(
            </Typography>
            <Typography variant="body1" align="center">
              {`status code: ${error.statusCode}`}
            </Typography>
            <Typography variant="body1" align="center">
              {!error.isServerError && 'Please check your url and try again.'}
              {error.isServerError && 'Something went wrong on our site. We are sorry for that.'}
            </Typography>
          </div>
        )}
      </main>
    );
  }
}

Index.getInitialProps = async ({ query }) => ({ resultSize: query.resultSize });

Index.propTypes = {
  resultSize: PropTypes.string.isRequired,
};

Index.defaultProps = { resultSize: '20' };

export default withLayout(withStyles(styles)(Index));
