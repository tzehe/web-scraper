import React from 'react';
import { render, fireEvent, cleanup, waitForElement, within } from 'react-testing-library';
import axiosMock from 'axios';
import Index from '../../pages/index';
import Router from 'next/router';

// mocked router for testing only

Router.router = {
  push: () => {},
  prefetch: () => {},
};

const setup = () => {
  const utils = render(<Index />);
  const input = utils.getByPlaceholderText('i.e. https://zalando.com/');
  const button = utils.getByTestId('submit');
  return {
    input,
    button,
    ...utils,
  };
};

afterEach(cleanup);

test('it should display error message if no input value provided', () => {
  const { input, button, ...utils } = setup();
  fireEvent.change(input, { target: { value: '' } });
  expect(input.value).toBe('');
  fireEvent.click(button);
  expect(utils.getByText('Url field is required!')).toBeTruthy();
});

test('it should display error message if no valid url provided', () => {
  const { input, button, ...utils } = setup();
  fireEvent.change(input, { target: { value: 'notvalidurl' } });
  const errorMessage = "Url 'notvalidurl' is not valid! Example https://www.zalando.de/";
  expect(input.value).toBe('notvalidurl');
  fireEvent.click(button);
  expect(utils.getByText(errorMessage)).toBeTruthy();
});

test('it should render <ResultList />', async () => {
  axiosMock.post.mockResolvedValueOnce({
    data: [{ word: 'the', frequency: 20 }, { word: 'mu', frequency: 10 }],
  });
  const API = 'http://localhost:8000/api/scrape';
  const url = 'https://www.zalando.de/';
  const { input, button, ...utils } = setup();
  fireEvent.change(input, { target: { value: url } });
  fireEvent.click(button);
  const resultList = await waitForElement(() => utils.getByTestId('result-list'));
  const rows = utils.queryAllByTestId('row');

  const the = within(resultList).getByText('the');

  expect(axiosMock.post).toHaveBeenCalledTimes(1);
  expect(axiosMock.post).toHaveBeenCalledWith(API, { url });
  expect(rows).toHaveLength(2);
  expect(the).toBeTruthy();
});

test('it should render an error page, server error', async () => {
  const serverError = { response: { status: 500 } };
  axiosMock.post.mockRejectedValueOnce(serverError);
  const { input, button, ...utils } = setup();
  const url = 'https://www.notavailable.de/';
  fireEvent.change(input, { target: { value: url } });
  fireEvent.click(button);

  const errorPage = await waitForElement(() => utils.getByTestId('error-page'));

  const status_code = within(errorPage).getByText('status code: 500');
  const errorMessage = within(errorPage).getByText(
    'Something went wrong on our site. We are sorry for that.',
  );
  expect(status_code).toBeTruthy();
  expect(errorMessage).toBeTruthy();
});
