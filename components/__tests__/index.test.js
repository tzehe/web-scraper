import React from 'react';
import { render, fireEvent, cleanup, waitForElement, within } from 'react-testing-library';
import axiosMock from 'axios';
import Index from '../../pages/index';
import Router from 'next/router';
import mockList from 'mockList';

// mocked router for testing only

Router.router = {
  push: () => {},
  prefetch: () => {},
};

const setup = resultSize => {
  const utils = render(<Index resultSize={resultSize} />);
  const input = utils.getByPlaceholderText('i.e. https://zalando.com/');
  const button = utils.getByTestId('submit');
  return {
    input,
    button,
    ...utils,
  };
};

afterEach(() => {
  axiosMock.post.mockClear();
  cleanup();
});

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

test('it should render <ResultList /> with 20 words (default)', async () => {
  axiosMock.post.mockResolvedValueOnce({
    data: mockList,
  });
  const API = `http://localhost:8000/api/scrape?resultSize=${20}`;
  const url = 'https://www.zalando.de/';
  const { input, button, ...utils } = setup();
  fireEvent.change(input, { target: { value: url } });
  fireEvent.click(button);
  const resultList = await waitForElement(() => utils.getByTestId('result-list'));
  const rows = utils.queryAllByTestId('row');

  expect(axiosMock.post).toHaveBeenCalledTimes(1);
  expect(axiosMock.post).toHaveBeenCalledWith(API, { url });
  expect(rows).toHaveLength(20);
});

test('it should show only 10 words', async () => {
  jest.restoreAllMocks();
  const resultSize = 10;
  axiosMock.post.mockResolvedValueOnce({
    data: mockList.slice(0, resultSize),
  });
  const API = `http://localhost:8000/api/scrape?resultSize=${resultSize}`;
  const url = 'https://www.zalando.de/';
  const { input, button, ...utils } = setup('10');
  fireEvent.change(input, { target: { value: url } });
  fireEvent.click(button);
  const resultList = await waitForElement(() => utils.getByTestId('result-list'));
  const rows = utils.queryAllByTestId('row');

  expect(axiosMock.post).toHaveBeenCalledTimes(1);
  expect(axiosMock.post).toHaveBeenCalledWith(API, { url });
  expect(rows).toHaveLength(10);
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
