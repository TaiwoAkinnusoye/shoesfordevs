import styled from 'styled-components';

const Supreme = styled.h3`
  background: ${props => props.theme.palevioletred};
  color: white;
  display: inline-block;
  padding: 4px 5px;
  transform: skew(-5deg);
  margin: 0;
  font-size: 1.2rem;
`;

export default Supreme;
