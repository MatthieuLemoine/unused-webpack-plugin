/* eslint no-undef: 0 */
const makeButton = (buttonName) => {
  const buttonLabel = `Button: ${buttonName}`;

  const button = document.createElement('button');
  button.innerText = buttonLabel;

  return button;
};

module.exports = makeButton;
