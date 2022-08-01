import styled, { css } from 'styled-components';
import styledEmotion from '@emotion/styled';

const Button = styled.a`
  /* This renders the buttons above... Edit me! */
  display: inline-block;
  border-radius: 3px;
  padding: 0.5rem 0;
  margin: 0.5rem 1rem;
  width: 11rem;
  background: transparent;
  color: white;
  border: 2px solid white;

  /* The GitHub button is a primary button
   * edit this to target it specifically! */
  ${props =>
    props.primary &&
    css`
      font-size: 21px;
      background: gray;
    `}
`;

const ButtonEmotion = styledEmotion.button`
  padding: 32px;
  background-color: hotpink;
  font-size: 22px;
  border-radius: 4px;
  color: black;
  font-weight: bold;
  &:hover {
    color: white;
  }
`;

export default () => (
  <>
    <Button id="style" rel="noopener" primary>
      style
    </Button>
    <hr />
    <ButtonEmotion id="emotionStyle">emotionStyle</ButtonEmotion>
  </>
);
