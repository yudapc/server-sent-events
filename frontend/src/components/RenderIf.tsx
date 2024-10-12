import { FC } from 'react';

interface IProps {
  isTrue: boolean;
  children: React.ReactNode;
}
const RenderIf: FC<IProps> = ({ isTrue, children }): any => {
  return isTrue ? children : null;
};

export default RenderIf;
