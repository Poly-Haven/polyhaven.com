import Link, { LinkProps } from 'next/link'

const LinkText = (props: React.PropsWithChildren<LinkProps>) => {
  return (
    <Link {...props} href={props.href || ''}>
      {props.children}
    </Link>
  );
}

export default LinkText
