import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';
import Index from '../../pages/index';
import Router from 'next/router';

// mocked router for testing only

Router.router = {
  push: () => {},
  prefetch: () => {},
};

const setup = () => {
  const utils = render(<Index />);
  const input = utils.getByPlaceholderText('url-input');
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
  expect(utils.getByText('Value field is required!')).toBeTruthy();
});

test('it should display error message if no valid url provided', () => {
  const { input, button, ...utils } = setup();
  fireEvent.change(input, { target: { value: 'notvalidurl' } });
  const errorMessage = "Value 'notvalidurl' is not a valid url! Example https://www.zalando.de/";
  expect(input.value).toBe('notvalidurl');
  fireEvent.click(button);
  expect(utils.getByText(errorMessage)).toBeTruthy();
});
