import styled from 'styled-components';

export const RequiredMark = styled.span`
  margin-left: 4px;
  color: ${({ theme }) => theme.colors.error};
  font-weight: 700;
`;
