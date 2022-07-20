import Link, { LinkProps } from 'next/link';

export const LinkText = (props: React.PropsWithChildren<LinkProps>) => {
  return (
    <Link {...props} href={props.href || ''} >
      <a>{props.children}</a>
    </Link>
  );
};