import logo from '../../assets/logo.png';

interface LogoProps {
  width?: string;
  height?: string;
}

export const Logo = (props: LogoProps) => (
  <img src={logo} width={props.width} height={props.height} alt="logo" />
);
